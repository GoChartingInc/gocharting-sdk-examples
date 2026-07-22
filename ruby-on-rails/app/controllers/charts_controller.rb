# Serves the page that hosts the GoCharting SDK.
#
# Nothing chart-specific happens server-side — the SDK is a browser library.
# Rails' only job is to render the container and pass configuration (symbol,
# interval, license key) down to the view.
class ChartsController < ApplicationController
  # show.html.erb is a complete HTML document (the chart needs full control of
  # <html>/<body> sizing), so skip the application layout — otherwise Rails
  # nests it inside layouts/application.html.erb and you get two <html> tags.
  layout false

  def show
    @symbol = params.fetch(:symbol, "BYBIT:FUTURE:BTCUSDT")
    @interval = params.fetch(:interval, "5m")
    # Keep the real key in credentials/ENV — never hard-code it in a view.
    @license_key = ENV.fetch("GOCHARTING_LICENSE_KEY", "demo-550e8400-e29b-41d4-a716-446655440000")
  end
end
