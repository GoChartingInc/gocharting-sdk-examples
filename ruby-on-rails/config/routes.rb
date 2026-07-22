# Add to your existing config/routes.rb
Rails.application.routes.draw do
  get "chart", to: "charts#show", as: :chart
  root "charts#show"
end
