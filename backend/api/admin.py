from django.contrib import admin
from django.contrib.auth import get_user_model
from django.contrib.auth.admin import UserAdmin
from django.utils.translation import gettext_lazy as _


@admin.register(get_user_model())
class CustomUserAdmin(UserAdmin):
    """Registered explicitly: django.contrib.auth.admin skips swapped auth.User."""

    ordering = ("email",)
    list_display = ("email", "username", "first_name", "last_name", "is_staff")
    list_filter = ("is_staff", "is_superuser", "is_active", "groups")
    search_fields = ("email", "first_name", "last_name", "username")
    fieldsets = (
        (None, {"fields": ("email", "password")}),
        (_("Personal info"), {"fields": ("first_name", "last_name", "second_last_name", "username")}),
        (
            _("Permissions"),
            {
                "fields": (
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                ),
            },
        ),
        (_("Important dates"), {"fields": ("last_login", "date_joined")}),
    )
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": ("email", "usable_password", "password1", "password2"),
            },
        ),
    )


_original_get_app_list = admin.AdminSite.get_app_list


def get_app_list(self, request, app_label=None):
    """
    List the user model under Authentication and Authorization (with Groups).

    Setting Meta.app_label = 'auth' on the user model is not supported: keep
    AUTH_USER_MODEL as 'api.CustomUser' and the model's real app_label as api.
    """
    app_list = _original_get_app_list(self, request, app_label)
    if app_label is not None:
        return app_list

    User = get_user_model()
    user_entries = []
    new_apps = []
    for app in app_list:
        others = [m for m in app["models"] if m["model"] is not User]
        user_entries.extend(m for m in app["models"] if m["model"] is User)
        if others:
            new_apps.append({**app, "models": others})

    merged = False
    for app in new_apps:
        if app["app_label"] == "auth":
            app["models"] = sorted(
                app["models"] + user_entries,
                key=lambda x: x["name"].lower(),
            )
            merged = True
            break

    if user_entries and not merged:
        return app_list

    return new_apps


admin.AdminSite.get_app_list = get_app_list
