import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.auth.base_user import BaseUserManager
from django.contrib.auth.models import Group

from .group_names import GLOBAL_ADMIN_GROUP_NAME


class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Debe de ser un correo electrónico')

        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        user = self.create_user(email, password, **extra_fields)

        try:
            global_admin_group, created = Group.objects.get_or_create(
                name=GLOBAL_ADMIN_GROUP_NAME,
            )
            if created:
                print(f"Group '{GLOBAL_ADMIN_GROUP_NAME}' created")
            user.groups.add(global_admin_group)
            user.save()
        except Group.DoesNotExist:
            print(f"Warning: The '{GLOBAL_ADMIN_GROUP_NAME}' group could not be created.")

        return user


class CustomUser(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    email = models.EmailField(max_length=200, unique=True)
    # Empty string, not NULL: Django admin UserChangeForm assumes str-like username.
    username = models.CharField(max_length=200, blank=True, default='')
    second_last_name = models.CharField(
        max_length=200, null=True, blank=True, verbose_name="Apellido Materno"
    )

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    class Meta:
        verbose_name = 'Usuario'
        verbose_name_plural = 'Usuarios'
        ordering = ['date_joined']

    def __str__(self):
        group_names = [group.name for group in self.groups.all()]
        groups_str = ", ".join(group_names)
        return f'{self.email} ({groups_str})'
