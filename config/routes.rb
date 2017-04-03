Rails.application.routes.draw do
  root 'trip_planner#index'
  get 'trip_planner/index'
  get 'trip_planner/_banner'
  get 'trip_planner/direction'
  get 'trip_planner/direction'

  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html

end

