"""Minimal Django settings for the GoCharting SDK example.

Only what's needed to serve one template with static files — no database,
no auth. Drop the chartapp/ package into a real project if you already
have one.
"""
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

# Example-only key. Use a real secret (from the environment) in production.
SECRET_KEY = "django-insecure-gocharting-sdk-example"
DEBUG = True
ALLOWED_HOSTS = ["*"]

INSTALLED_APPS = [
    "django.contrib.staticfiles",
    "chartapp",
]

MIDDLEWARE = [
    "django.middleware.common.CommonMiddleware",
]

ROOT_URLCONF = "chartsite.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "APP_DIRS": True,
        "DIRS": [],
        "OPTIONS": {"context_processors": []},
    },
]

WSGI_APPLICATION = "chartsite.wsgi.application"

STATIC_URL = "static/"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
