<?php

namespace App\Http\Controllers\Client;

use App\Events\Ticket\TicketCreated;
use App\Events\Ticket\TicketMessageCreated;
use App\Http\Controllers\Controller;
use App\Models\Ticket;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Thunk\Verbs\Facades\Verbs;

class TicketController extends Controller
{
    /**
     * Display a listing of user's tickets.
     */
    public function index(Request $request)
    {
        $query = Ticket::where('user_id', Auth::id())
            ->with(['assignedAdmin'])
            ->orderBy('created_at', 'desc');

        // Filter by status
        if ($request->filled('status')) {
            $status = \App\Enums\TicketStatus::tryFrom($request->status);
            if ($status) {
                $query->where('status', $status->value);
            }
        }

        $tickets = $query->paginate(15)->withQueryString();

        return Inertia::render('client/tickets/index', [
            'tickets' => $tickets->through(fn($ticket) => [
                'uuid' => $ticket->uuid,
                'reference' => $ticket->reference,
                'subject' => $ticket->subject,
                'status' => $ticket->status->value,
                'status_label' => $ticket->status->label(),
                'status_color' => $ticket->status->color(),
                'priority' => $ticket->priority->value,
                'priority_label' => $ticket->priority->label(),
                'priority_color' => $ticket->priority->color(),
                'created_at' => $ticket->created_at->format('M j, Y H:i'),
                'last_message_at' => $ticket->last_message_at?->format('M j, Y H:i'),
                'assigned_to' => $ticket->assignedAdmin?->name ?? null,
                'can_add_message' => $ticket->canAddMessage(),
            ]),
            'filters' => [
                'status' => $request->status,
            ],
        ]);
    }

    /**
     * Display ticket creation form.
     */
    public function create()
    {
        return Inertia::render('client/tickets/create');
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

        $priority = \App\Enums\TicketPriority::tryFrom(
            $validated['priority'] ?? 'medium'
        ) ?? \App\Enums\TicketPriority::Medium;

        // Create ticket using Verbs event
        $event = TicketCreated::fire(
            name: $validated['name'],
            email: $validated['email'],
            subject: $validated['subject'],
            message: $validated['message'],
            priority: $priority,
            user_id: Auth::id(),
        );

        // Commit the event immediately so we can read the ticket
        Verbs::commit();

        // Get the created ticket from the database
        $ticket = Ticket::find($event->ticket_id);

        return redirect()->route('client.tickets.show', $ticket->uuid)
            ->with('success', 'Ticket created successfully.');
    }

    /**
     * Display the specified ticket.
     */
    public function show(string $uuid)
    {
        $ticket = Ticket::where('uuid', $uuid)
            ->where('user_id', Auth::id())
            ->with(['messages' => function ($query) {
                $query->orderBy('created_at');
            }, 'assignedAdmin'])
            ->firstOrFail();

        return Inertia::render('client/tickets/show', [
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
            'messages' => $ticket->messages->map(fn($msg) => [
                'uuid' => $msg->uuid,
                'message' => $msg->message,
                'is_internal' => $msg->is_internal,
                'sender_name' => $msg->sender_name,
                'sender_email' => $msg->sender_email,
                'is_admin' => $msg->isAdmin(),
                'created_at' => $msg->created_at->format('M j, Y H:i'),
            ]),
        ]);
    }

    /**
     * Add a message to the ticket.
     */
    public function reply(Request $request, string $uuid)
    {
        $ticket = Ticket::where('uuid', $uuid)
            ->where('user_id', Auth::id())
            ->firstOrFail();

        if (!$ticket->canAddMessage()) {
            return back()->with('error', 'Cannot reply to closed ticket.');
        }

        $validated = $request->validate([
            'message' => 'required|string|max:5000',
        ]);

        // Create message using Verbs event
        TicketMessageCreated::fire(
            ticket_id: $ticket->id,
            message: $validated['message'],
            is_internal: false,
            user_id: Auth::id(),
            sender_name: $ticket->name,
            sender_email: $ticket->email,
        );

        return back()->with('success', 'Message sent successfully.');
    }
}
