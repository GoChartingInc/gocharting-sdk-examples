import os

from django.shortcuts import render


def chart(request):
    """Render the page that hosts the GoCharting SDK.

    Nothing chart-specific happens server-side — the SDK is a browser library.
    Django's only job is to render the container and pass configuration
    (symbol, interval, license key) into the template.
    """
    return render(
        request,
        "chartapp/chart.html",
        {
            "symbol": request.GET.get("symbol", "BYBIT:FUTURE:BTCUSDT"),
            "interval": request.GET.get("interval", "5m"),
            # Keep the real key in the environment — never hard-code it.
            "license_key": os.environ.get(
                "GOCHARTING_LICENSE_KEY",
                "demo-550e8400-e29b-41d4-a716-446655440000",
            ),
        },
    )
