from django.contrib.auth import password_validation
from django.contrib.auth.models import Group
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers

from .models import CustomUser


class GroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ('id', 'name')


class UserSerializer(serializers.ModelSerializer):
    groups = GroupSerializer(many=True, read_only=True)

    class Meta:
        model = CustomUser
        fields = (
            'id',
            'email',
            'username',
            'first_name',
            'last_name',
            'second_last_name',
            'is_active',
            'is_staff',
            'is_superuser',
            'groups',
        )


class ProfileUpdateSerializer(serializers.Serializer):
    """PATCH perfil: solo nombre(s) y usuario. La contraseña va en otro endpoint."""

    first_name = serializers.CharField(required=False, allow_blank=True, max_length=150)
    last_name = serializers.CharField(required=False, allow_blank=True, max_length=150)
    second_last_name = serializers.CharField(
        required=False, allow_blank=True, max_length=200,
    )
    username = serializers.CharField(
        required=False, allow_blank=True, max_length=200,
    )

    def validate_username(self, value):
        if value is None:
            return ''
        value = value.strip()
        if not value:
            return ''
        qs = CustomUser.objects.exclude(pk=self.instance.pk).filter(username=value)
        if qs.exists():
            raise serializers.ValidationError(
                'Este nombre de usuario ya está en uso.',
            )
        return value

    def update(self, instance, validated_data):
        if 'username' in validated_data:
            instance.username = validated_data.pop('username') or ''

        for attr in ('first_name', 'last_name', 'second_last_name'):
            if attr in validated_data:
                setattr(instance, attr, validated_data[attr])

        instance.save()
        return instance

    def to_representation(self, instance):
        return UserSerializer(instance, context=self.context).data


class PasswordChangeSerializer(serializers.Serializer):
    """POST dedicado al cambio de contraseña (no mezclar con datos de perfil)."""

    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True)
    re_new_password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        user = self.context['request'].user
        if not user.check_password(attrs['current_password']):
            raise serializers.ValidationError({
                'current_password': ['La contraseña actual no es correcta.'],
            })
        if attrs['new_password'] != attrs['re_new_password']:
            raise serializers.ValidationError({
                're_new_password': ['Las contraseñas nuevas no coinciden.'],
            })
        try:
            password_validation.validate_password(attrs['new_password'], user=user)
        except DjangoValidationError as e:
            raise serializers.ValidationError({
                'new_password': list(e.messages),
            }) from e
        return attrs

    def save(self):
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save(update_fields=['password'])
        return user


class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    re_password = serializers.CharField(write_only=True)
    birth_date = serializers.DateField(required=False, allow_null=True)
    school_grade = serializers.IntegerField(required=False, allow_null=True)
    first_name = serializers.CharField()
    last_name = serializers.CharField()
    second_last_name = serializers.CharField(
        required=False, allow_blank=True, default='',
    )

    def validate_first_name(self, value):
        trimmed = value.strip()
        if not trimmed:
            raise serializers.ValidationError('El nombre es obligatorio.')
        return trimmed

    def validate_last_name(self, value):
        trimmed = value.strip()
        if not trimmed:
            raise serializers.ValidationError('El primer apellido es obligatorio.')
        return trimmed

    def validate_second_last_name(self, value):
        return value.strip()

    def validate_birth_date(self, value):
        if value is None:
            return value
        from django.utils import timezone

        if value > timezone.localdate():
            raise serializers.ValidationError(
                'La fecha de nacimiento no puede ser futura.',
            )
        return value

    def validate(self, attrs):
        if attrs['password'] != attrs['re_password']:
            raise serializers.ValidationError(
                {'re_password': 'Passwords do not match.'},
            )
        user = CustomUser(email=attrs['email'].lower())
        try:
            password_validation.validate_password(attrs['password'], user=user)
        except DjangoValidationError as e:
            raise serializers.ValidationError({'password': list(e.messages)}) from e
        return attrs


class ActivateSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()


class PasswordResetConfirmSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField(write_only=True)
    re_new_password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        if attrs['new_password'] != attrs['re_new_password']:
            raise serializers.ValidationError(
                {'re_new_password': 'Passwords do not match.'},
            )
        return attrs


class ResendActivationSerializer(serializers.Serializer):
    email = serializers.EmailField()
