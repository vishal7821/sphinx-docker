from django.core.validators import RegexValidator,EmailValidator

alphanumeric = RegexValidator(r'^[0-9a-zA-Z]*$', 'Only alphanumeric characters are allowed.')
email_validator = EmailValidator(message="Email id is not valid", code='NOVAL')
