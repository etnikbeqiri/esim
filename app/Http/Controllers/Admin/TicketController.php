<?php

namespace App\Http\Controllers\Admin;

use App\Enums\TicketStatus;
use App\Events\Ticket\TicketAssigned;
use App\Events\Ticket\TicketClosed;
use App\Events\Ticket\TicketStatusUpdated;
use App\Http\Controllers\Controller;
use App\Models\Ticket;
use App\Models\User;
use App\Services\TicketService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class TicketController extends Controller
{
    public function __construct(
        protected TicketService $ticketService
    ) {}

    /**
     * Display a listing of tickets.
     */
    public function index(Request $request)
    {
        $query = Ticket::with(['user', 'assignedAdmin'])
            ->orderBy('created_at', 'desc');

        // Filter by status
        if ($request->filled('status') && $request->status !== 'all') {
            $status = TicketStatus::tryFrom($request->status);
            if ($status) {
                $query->where('status', $status->value);
            }
        }

        // Search by name, email, or subject
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('subject', 'like', "%{$search}%")
                    ->orWhere('message', 'like', "%{$search}%");
            });
        }

        $tickets = $query->paginate(20)->withQueryString();

        // Get status counts
        $statusCounts = [
            'all' => Ticket::count(),
            'open' => Ticket::where('status', 'open')->count(),
            'in_progress' => Ticket::where('status', 'in_progress')->count(),
            'waiting_on_customer' => Ticket::where('status', 'waiting_on_customer')->count(),
            'resolved' => Ticket::where('status', 'resolved')->count(),
            'closed' => Ticket::where('status', 'closed')->count(),
            'archived' => Ticket::where('status', 'archived')->count(),
        ];

        return Inertia::render('admin/tickets/index', [
            'tickets' => $tickets->through(fn($ticket) => $this->ticketService->formatTicket($ticket, detailed: true)),
            'statusCounts' => $statusCounts,
            'filters' => [
                'search' => $request->search,
                'status' => $request->status,
            ],
        ]);
    }

    /**
     * Display specified ticket.
     */
    public function show(Ticket $ticket)
    {
        $ticket->load(['user', 'assignedAdmin']);

        // Get admin users for assignment dropdown
        $adminUsers = User::where('id', 1)
            ->orWhere('email', 'like', '%admin%')
            ->get(['id', 'name', 'email']);

        $messages = $this->ticketService->getMessagesWithInitial($ticket, includeInternal: true);

        return Inertia::render('admin/tickets/show', [
            'ticket' => array_merge(
                $this->ticketService->formatTicket($ticket, detailed: true),
                ['user' => $ticket->user]
            ),
            'messages' => $messages,
            'adminUsers' => $adminUsers->map(fn($user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ]),
        ]);
    }

    /**
     * Update ticket status.
     */
    public function updateStatus(Request $request, Ticket $ticket)
    {
        $validated = $request->validate([
            'status' => 'required|in:open,in_progress,waiting_on_customer,resolved,closed,archived',
        ]);

        $newStatus = TicketStatus::tryFrom($validated['status']);

        if (!$newStatus || !$ticket->canTransitionTo($newStatus)) {
            return back()->with('error', 'Invalid status transition.');
        }

        TicketStatusUpdated::fire(
            ticket_id: $ticket->id,
            new_status: $newStatus,
            updated_by: Auth::id(),
        );

        return back()->with('success', 'Ticket status updated successfully.');
    }

    /**
     * Assign ticket to admin.
     */
    public function assign(Request $request, Ticket $ticket)
    {
        $validated = $request->validate([
            'assigned_to' => 'nullable|exists:users,id',
        ]);

        // Convert empty string to null for unassignment
        $assignedTo = !empty($validated['assigned_to']) ? (int) $validated['assigned_to'] : null;

        TicketAssigned::fire(
            ticket_id: $ticket->id,
            assigned_to: $assignedTo,
            assigned_by: Auth::id(),
        );

        $message = $assignedTo ? 'Ticket assigned successfully.' : 'Ticket unassigned successfully.';
        return back()->with('success', $message);
    }

    /**
     * Add a message to the ticket.
     */
    public function reply(Request $request, Ticket $ticket)
    {
        if (!$ticket->canAddMessage()) {
            return back()->with('error', 'Cannot reply to closed ticket.');
        }

        $validated = $request->validate([
            'message' => 'required|string|max:5000',
            'is_internal' => 'nullable|boolean',
        ]);

        $isInternal = $validated['is_internal'] ?? false;

        // Add message
        $this->ticketService->addMessage(
            ticket: $ticket,
            message: $validated['message'],
            isInternal: $isInternal,
            userId: Auth::id(),
            senderName: Auth::user()->name,
            senderEmail: Auth::user()->email,
        );

        // Notify customer (unless internal note)
        if (!$isInternal) {
            $this->ticketService->notifyCustomerReply($ticket, $validated['message']);
        }

        return back()->with('success', 'Message sent successfully.');
    }

    /**
     * Close the ticket.
     */
    public function close(Request $request, Ticket $ticket)
    {
        $validated = $request->validate([
            'resolution_note' => 'nullable|string|max:1000',
        ]);

        TicketClosed::fire(
            ticket_id: $ticket->id,
            closed_by: Auth::id(),
            resolution_note: $validated['resolution_note'] ?? null,
        );

        return back()->with('success', 'Ticket closed successfully.');
    }

    /**
     * Delete the ticket.
     */
    public function destroy(Ticket $ticket)
    {
        $ticket->delete();

        return redirect()->route('admin.tickets.index')
            ->with('success', 'Ticket deleted successfully.');
    }

    /**
     * Send email notification to customer about ticket update.
     */
    public function notify(Request $request, Ticket $ticket)
    {
        $validated = $request->validate([
            'message' => 'nullable|string|max:500',
        ]);

        $this->ticketService->notifyCustomerReply($ticket, $validated['message'] ?? '');

        return back()->with('success', 'Email notification sent to customer.');
    }

    /**
     * Stream ticket updates via Server-Sent Events.
     */
    public function stream(Ticket $ticket): \Symfony\Component\HttpFoundation\StreamedResponse
    {
        return $this->ticketService->streamUpdates($ticket, includeInternal: true);
    }
}
