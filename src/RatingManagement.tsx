import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { AdminLayout } from "./AdminLayout";
import { toast } from "sonner";

export function RatingManagement() {
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [recalculateResult, setRecalculateResult] = useState<any>(null);
  
  const recalculateAllRatings = useMutation(api.ratings.recalculateAllRatings);
  const ratingAnalytics = useQuery(api.ratings.getRatingAnalytics);

  const handleRecalculateAll = async () => {
    if (!confirm("This will recalculate ratings for all items. Continue?")) {
      return;
    }

    setIsRecalculating(true);
    setRecalculateResult(null);

    try {
      const result = await recalculateAllRatings();
      setRecalculateResult(result);
      toast.success(`Successfully recalculated ${result.updatedCount} ratings`);
    } catch (error) {
      console.error("Error recalculating ratings:", error);
      toast.error("Failed to recalculate ratings");
    } finally {
      setIsRecalculating(false);
    }
  };

  return (
    <AdminLayout currentPage="ratings" pageTitle="Rating Management">
      <div className="container-fluid">
        {/* Recalculate Section */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="main__title">
              <h2>Recalculate Ratings</h2>
            </div>
          </div>
          <div className="col-12">
            <div className="sign__group" style={{ backgroundColor: '#28282d', padding: '20px', borderRadius: '8px' }}>
              <p style={{ color: '#b3b3b3', marginBottom: '15px' }}>
                This will recalculate dynamic ratings for all items based on admin baseline ratings and user reviews.
                Use this after making changes to the rating algorithm or to fix any inconsistencies.
              </p>
              <button
                onClick={handleRecalculateAll}
                disabled={isRecalculating}
                className="sign__btn"
                style={{ marginBottom: '15px' }}
              >
                {isRecalculating ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Recalculating...
                  </>
                ) : (
                  "Recalculate All Ratings"
                )}
              </button>

              {recalculateResult && (
                <div style={{ 
                  backgroundColor: '#1f1f24', 
                  padding: '15px', 
                  borderRadius: '6px',
                  marginTop: '15px'
                }}>
                  <h4 style={{ color: '#fff', marginBottom: '10px' }}>Results:</h4>
                  <ul style={{ color: '#b3b3b3', marginBottom: 0 }}>
                    <li>Total Items: {recalculateResult.totalItems}</li>
                    <li>Updated: {recalculateResult.updatedCount}</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Analytics Section */}
        {ratingAnalytics && (
          <>
            <div className="row mb-4">
              <div className="col-12">
                <div className="main__title">
                  <h2>Rating Analytics</h2>
                </div>
              </div>
              <div className="col-12 col-md-6 col-lg-3">
                <div className="stats" style={{ backgroundColor: '#28282d', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
                  <h3 style={{ color: '#ff1493', fontSize: '2rem', marginBottom: '5px' }}>
                    {ratingAnalytics.totalItems}
                  </h3>
                  <p style={{ color: '#b3b3b3', marginBottom: 0 }}>Total Items with Ratings</p>
                </div>
              </div>
              <div className="col-12 col-md-6 col-lg-3">
                <div className="stats" style={{ backgroundColor: '#28282d', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
                  <h3 style={{ color: '#ff1493', fontSize: '2rem', marginBottom: '5px' }}>
                    {ratingAnalytics.itemsWithUserReviews}
                  </h3>
                  <p style={{ color: '#b3b3b3', marginBottom: 0 }}>Items with User Reviews</p>
                </div>
              </div>
              <div className="col-12 col-md-6 col-lg-3">
                <div className="stats" style={{ backgroundColor: '#28282d', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
                  <h3 style={{ color: '#ff1493', fontSize: '2rem', marginBottom: '5px' }}>
                    {ratingAnalytics.averageUserRatingCount.toFixed(1)}
                  </h3>
                  <p style={{ color: '#b3b3b3', marginBottom: 0 }}>Avg Reviews per Item</p>
                </div>
              </div>
            </div>

            {/* Most Reviewed Items */}
            <div className="row mb-4">
              <div className="col-12">
                <div className="main__title">
                  <h2>Most Reviewed Items</h2>
                </div>
              </div>
              <div className="col-12">
                <div className="main__table-wrap" style={{ backgroundColor: '#28282d', borderRadius: '8px', overflow: 'hidden' }}>
                  <table className="main__table">
                    <thead>
                      <tr>
                        <th>TITLE</th>
                        <th>ADMIN RATING</th>
                        <th>USER AVG</th>
                        <th>REVIEWS</th>
                        <th>DYNAMIC RATING</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ratingAnalytics.mostReviewed.slice(0, 10).map((item) => (
                        <tr key={item.itemId}>
                          <td>
                            <div className="main__table-text">
                              <a href={`/details/${item.slug}`}>{item.title}</a>
                            </div>
                          </td>
                          <td>
                            <div className="main__table-text">
                              {item.adminRating?.toFixed(1) || 'N/A'}
                            </div>
                          </td>
                          <td>
                            <div className="main__table-text">
                              {item.userRatingAverage?.toFixed(1) || 'N/A'}
                            </div>
                          </td>
                          <td>
                            <div className="main__table-text">
                              {item.userRatingCount}
                            </div>
                          </td>
                          <td>
                            <div className="main__table-text">
                              <span className={`badge ${
                                item.dynamicRating >= 8 ? 'bg-success' :
                                item.dynamicRating >= 6 ? 'bg-warning' :
                                'bg-danger'
                              }`}>
                                {item.dynamicRating?.toFixed(1) || 'N/A'}
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Biggest Rating Differences */}
            <div className="row mb-4">
              <div className="col-12">
                <div className="main__title">
                  <h2>Biggest Rating Differences (Admin vs User)</h2>
                </div>
              </div>
              <div className="col-12">
                <div className="main__table-wrap" style={{ backgroundColor: '#28282d', borderRadius: '8px', overflow: 'hidden' }}>
                  <table className="main__table">
                    <thead>
                      <tr>
                        <th>TITLE</th>
                        <th>ADMIN RATING</th>
                        <th>USER AVG</th>
                        <th>DIFFERENCE</th>
                        <th>REVIEWS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ratingAnalytics.biggestDifferences
                        .filter(item => item.userRatingCount > 0)
                        .slice(0, 10)
                        .map((item) => (
                        <tr key={item.itemId}>
                          <td>
                            <div className="main__table-text">
                              <a href={`/details/${item.slug}`}>{item.title}</a>
                            </div>
                          </td>
                          <td>
                            <div className="main__table-text">
                              {item.adminRating?.toFixed(1) || 'N/A'}
                            </div>
                          </td>
                          <td>
                            <div className="main__table-text">
                              {item.userRatingAverage?.toFixed(1) || 'N/A'}
                            </div>
                          </td>
                          <td>
                            <div className="main__table-text">
                              <span className={`badge ${
                                item.ratingDifference >= 2 ? 'bg-danger' :
                                item.ratingDifference >= 1 ? 'bg-warning' :
                                'bg-success'
                              }`}>
                                {item.ratingDifference.toFixed(1)}
                              </span>
                            </div>
                          </td>
                          <td>
                            <div className="main__table-text">
                              {item.userRatingCount}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
