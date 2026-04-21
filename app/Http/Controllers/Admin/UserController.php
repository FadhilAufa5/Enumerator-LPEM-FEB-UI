<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index()
    {
        $users = User::with('role')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn($user) => [
                'id'                => $user->id,
                'name'              => $user->name,
                'email'             => $user->email,
                'status'            => $user->status ?? 'active',
                'role'              => $user->role ? [
                    'id'          => $user->role->id,
                    'name'        => $user->role->name,
                    'label'       => $user->role->label,
                    'color'       => $user->role->color,
                    'is_system'   => $user->role->is_system,
                    'permissions' => [],
                    'users_count' => $user->role->users_count,
                    'created_at'  => $user->role->created_at,
                    'updated_at'  => $user->role->updated_at,
                ] : null,
                'email_verified_at' => $user->email_verified_at?->toDateTimeString(),
                'last_login'        => null,
                'created_at'        => $user->created_at->toDateTimeString(),
                'updated_at'        => $user->updated_at->toDateTimeString(),
            ]);

        $roles = Role::orderBy('name')->get(['id', 'name', 'label', 'color', 'is_system']);

        return Inertia::render('admin/users/index', [
            'users' => $users,
            'roles' => $roles,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'role_id'  => 'nullable|exists:roles,id',
            'status'   => 'nullable|in:active,inactive,suspended',
        ]);

        User::create([
            'name'              => $validated['name'],
            'email'             => $validated['email'],
            'password'          => Hash::make($validated['password']),
            'role_id'           => $validated['role_id'] ?? null,
            'status'            => $validated['status'] ?? 'active',
            'email_verified_at' => now(),
        ]);

        return redirect()->back()->with('success', 'User berhasil ditambahkan.');
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users,email,' . $user->id,
            'password' => 'nullable|string|min:8',
            'role_id'  => 'nullable|exists:roles,id',
            'status'   => 'nullable|in:active,inactive,suspended',
        ]);

        $user->update([
            'name'    => $validated['name'],
            'email'   => $validated['email'],
            'role_id' => $validated['role_id'] ?? null,
            'status'  => $validated['status'] ?? $user->status,
            ...(!empty($validated['password']) ? ['password' => Hash::make($validated['password'])] : []),
        ]);

        return redirect()->back()->with('success', 'User berhasil diperbarui.');
    }

    public function updateStatus(Request $request, User $user)
    {
        $request->validate(['status' => 'required|in:active,inactive,suspended']);
        $user->update(['status' => $request->status]);
        return redirect()->back()->with('success', 'Status user diperbarui.');
    }

    public function destroy(User $user)
    {
        if ($user->id === auth()->id()) {
            return redirect()->back()->withErrors(['error' => 'Tidak dapat menghapus akun sendiri.']);
        }

        $user->delete();
        return redirect()->back()->with('success', 'User berhasil dihapus.');
    }
}
