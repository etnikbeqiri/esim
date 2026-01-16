<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Ticket;
use App\Services\TicketService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\StreamedResponse;

class TicketController extends Controller
{
    public function __construct(
        protected TicketService $ticketService
    ) {}

    /**
     * Display the support ticket page with creation form.
     */
    public function index()
    {
        $user = Auth::user();

        // Get user's tickets if logged in
        $userTickets = [];
        if ($user) {
            $userTickets = Ticket::where('user_id', $user->id)
                ->orWhere('email', $user->email)
                ->orderBy('created_at', 'desc')
                ->limit(10)
                ->get()
                ->map(fn($ticket) => [
                    'uuid' => $ticket->uuid,
                    'reference' => $ticket->reference,
                    'subject' => $ticket->subject,
                    'status' => $ticket->status->value,
                    'status_label' => $ticket->status->label(),
                    'status_color' => $ticket->status->color(),
                    'created_at' => $ticket->created_at->format('M j, Y'),
                    'updated_at' => $ticket->updated_at->format('M j, Y'),
                ]);
        }

        return Inertia::render('public/tickets/index', [
            'prefill' => $user ? [
                'name' => $user->name,
                'email' => $user->email,
            ] : null,
            'userTickets' => $userTickets,
        ]);
    }

    /**
     * Store a newly created ticket in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'subject' => 'required|string|max:255',
            'message' => 'required|string|max:5000',
            'priority' => 'nullable|in:low,medium,high,urgent',
        ]);

        // Create ticket
        $ticket = $this->ticketService->createTicket($validated, Auth::id());

        // Send notifications
        $this->ticketService->notifyCustomerTicketCreated($ticket);
        $this->ticketService->notifyAdminTicketCreated($ticket);

        return redirect()->route('tickets.show', [
            'uuid' => $ticket->uuid,
            'email' => $ticket->email,
        ])->with('success', 'Ticket created successfully.');
    }

    /**
     * Lookup a ticket by reference and email.
     */
    public function lookup(Request $request)
    {
        $validated = $request->validate([
            'reference' => 'required|string',
            'email' => 'required|email',
        ]);

        $ticket = Ticket::where('reference', $validated['reference'])
            ->where('email', $validated['email'])
            ->first();

        if (!$ticket) {
            return back()->withErrors([
                'reference' => __('messages.ticket.not_found'),
            ]);
        }

        return redirect()->route('tickets.show', [
            'uuid' => $ticket->uuid,
            'email' => $ticket->email,
        ]);
    }

    /**
     * Display the specified ticket with messages.
     */
    public function show(Request $request, string $uuid, string $email)
    {
        $ticket = Ticket::where('uuid', $uuid)
            ->where('email', $email)
            ->with('assignedAdmin')
            ->firstOrFail();

        $messages = $this->ticketService->getMessagesWithInitial($ticket, includeInternal: false);

        return Inertia::render('public/tickets/show', [
            'ticket' => [
                'uuid' => $ticket->uuid,
                'reference' => $ticket->reference,
                'subject' => $ticket->subject,
                'name' => $ticket->name,
                'email' => $ticket->email,
                'status' => $ticket->status->value,
                'status_label' => $ticket->status->label(),
                'status_color' => $ticket->status->color(),
                'priority' => $ticket->priority->value,
                'priority_label' => $ticket->priority->label(),
                'priority_color' => $ticket->priority->color(),
                'created_at' => $ticket->created_at->format('M j, Y H:i'),
                'can_add_message' => $ticket->canAddMessage(),
                'assigned_to' => $ticket->assignedAdmin?->name ?? null,
            ],
            'messages' => $messages,
            'customer_email' => $email,
        ]);
    }

    /**
     * Add a message to the ticket.
     */
    public function reply(Request $request, string $uuid, string $email)
    {
        $ticket = Ticket::where('uuid', $uuid)
            ->where('email', $email)
            ->with('assignedAdmin')
            ->firstOrFail();

        if (!$ticket->canAddMessage()) {
            return back()->with('error', 'Cannot reply to closed ticket.');
        }

        $validated = $request->validate([
            'message' => 'required|string|max:5000',
        ]);

        // Add message
        $this->ticketService->addMessage(
            ticket: $ticket,
            message: $validated['message'],
            isInternal: false,
            userId: Auth::id(),
            senderName: $ticket->name,
            senderEmail: $ticket->email,
        );

        // Notify admin
        $this->ticketService->notifyAdminReply($ticket, $validated['message']);

        return back()->with('success', 'Message sent successfully.');
    }

    /**
     * Stream ticket updates via Server-Sent Events.
     */
    public function stream(string $uuid, string $email): StreamedResponse
    {
        $ticket = Ticket::where('uuid', $uuid)
            ->where('email', $email)
            ->firstOrFail();

        return $this->ticketService->streamUpdates($ticket);
    }
}
