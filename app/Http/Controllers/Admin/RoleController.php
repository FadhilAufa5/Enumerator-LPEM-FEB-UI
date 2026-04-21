<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Permission;
use App\Models\Role;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RoleController extends Controller
{
    public function index()
    {
        $roles = Role::withCount('users')
            ->with('permissions')
            ->orderBy('id')
            ->get()
            ->map(fn($role) => [
                'id'          => $role->id,
                'name'        => $role->name,
                'label'       => $role->label,
                'description' => $role->description,
                'color'       => $role->color,
                'is_system'   => $role->is_system,
                'users_count' => $role->users_count,
                'permissions' => $role->permissions->map(fn($p) => [
                    'id'    => $p->id,
                    'name'  => $p->name,
                    'label' => $p->label,
                    'group' => $p->group,
                ])->values(),
                'created_at'  => $role->created_at->toDateTimeString(),
                'updated_at'  => $role->updated_at->toDateTimeString(),
            ]);

        $permissions = Permission::orderBy('group')->orderBy('name')->get(['id', 'name', 'label', 'group']);

        return Inertia::render('admin/roles/index', [
            'roles'          => $roles,
            'allPermissions' => $permissions,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'           => 'required|string|max:100|unique:roles,name',
            'label'          => 'required|string|max:100',
            'description'    => 'nullable|string|max:500',
            'color'          => 'nullable|in:violet,blue,emerald,slate',
            'permission_ids' => 'nullable|array',
            'permission_ids.*' => 'exists:permissions,id',
        ]);

        $role = Role::create([
            'name'        => $validated['name'],
            'label'       => $validated['label'],
            'description' => $validated['description'] ?? null,
            'color'       => $validated['color'] ?? 'slate',
            'is_system'   => false,
        ]);

        if (!empty($validated['permission_ids'])) {
            $role->permissions()->sync($validated['permission_ids']);
        }

        return redirect()->back()->with('success', 'Role berhasil ditambahkan.');
    }

    public function update(Request $request, Role $role)
    {
        $validated = $request->validate([
            'name'           => 'required|string|max:100|unique:roles,name,' . $role->id,
            'label'          => 'required|string|max:100',
            'description'    => 'nullable|string|max:500',
            'color'          => 'nullable|in:violet,blue,emerald,slate',
            'permission_ids' => 'nullable|array',
            'permission_ids.*' => 'exists:permissions,id',
        ]);

        $role->update([
            'name'        => $validated['name'],
            'label'       => $validated['label'],
            'description' => $validated['description'] ?? null,
            'color'       => $validated['color'] ?? $role->color,
        ]);

        $role->permissions()->sync($validated['permission_ids'] ?? []);

        return redirect()->back()->with('success', 'Role berhasil diperbarui.');
    }

    public function destroy(Role $role)
    {
        if ($role->is_system) {
            return redirect()->back()->withErrors(['error' => 'Role sistem tidak dapat dihapus.']);
        }

        $role->permissions()->detach();
        $role->delete();

        return redirect()->back()->with('success', 'Role berhasil dihapus.');
    }
}
