require 'test_helper'

class TripPlannerControllerTest < ActionDispatch::IntegrationTest
  test "should get index" do
    get trip_planner_index_url
    assert_response :success
  end

end
