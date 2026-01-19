import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Header } from "./Header";
import { Footer } from "./Footer";
import "./sign.css";

export function PublicActors() {
  const actors = useQuery(api.actors.getActors);
  const [filterCareer, setFilterCareer] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Get unique career types for filter
  const careerTypes = actors 
    ? ["All", ...Array.from(new Set(actors.map(actor => actor.career)))]
    : ["All"];

  // Filter actors based on selected career and search query
  const filteredActors = actors?.filter(actor => {
    const matchesCareer = filterCareer === "All" || actor.career === filterCareer;
    const matchesSearch = searchQuery === "" || 
      actor.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCareer && matchesSearch;
  }) || [];

  return (
    <>
      <Header />
      <main className="main">
        <div className="section section--catalog">
          <div className="container">
            <div className="row">
              <div className="col-12">
                <div className="section__title-wrap" style={{ marginBottom: '20px' }}>
                  <h1 className="home__title">
                    <b>Actors</b>
                  </h1>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="row">
              <div className="col-12">
                <div className="filter__dropdowns" style={{ 
                  display: 'flex', 
                  gap: '15px', 
                  flexWrap: 'wrap',
                  marginBottom: '30px'
                }}>
                  {/* Career Type Filter */}
                  <div style={{ flex: '1 1 200px', minWidth: '200px' }}>
                    <label style={{ 
                      display: 'block', 
                      color: '#fff', 
                      marginBottom: '8px',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}>
                      Filter by Career Type
                    </label>
                    <select 
                      value={filterCareer}
                      onChange={(e) => setFilterCareer(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 15px',
                        backgroundColor: '#28282d',
                        color: '#fff',
                        border: '1px solid #3d3d42',
                        borderRadius: '6px',
                        fontSize: '14px',
                        cursor: 'pointer',
                        outline: 'none'
                      }}
                    >
                      {careerTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  {/* Search Filter */}
                  <div style={{ flex: '1 1 200px', minWidth: '200px' }}>
                    <label style={{ 
                      display: 'block', 
                      color: '#fff', 
                      marginBottom: '8px',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}>
                      Search Actors
                    </label>
                    <input
                      type="text"
                      placeholder="Search by name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 15px',
                        backgroundColor: '#28282d',
                        color: '#fff',
                        border: '1px solid #3d3d42',
                        borderRadius: '6px',
                        fontSize: '14px',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>

                {/* Results count */}
                <div style={{ 
                  color: '#b3b3b3', 
                  fontSize: '14px', 
                  marginBottom: '10px' 
                }}>
                  Showing {filteredActors.length} {filteredActors.length === 1 ? 'actor' : 'actors'}
                </div>
              </div>
            </div>

            {/* Actors Grid */}
            <div className="row">
              {!actors ? (
                <div className="col-12 text-center" style={{ padding: '3rem 0' }}>
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : filteredActors.length === 0 ? (
                <div className="col-12 text-center" style={{ padding: '3rem 0' }}>
                  <p style={{ color: '#b3b3b3', fontSize: '1.1rem' }}>
                    No actors found matching your criteria.
                  </p>
                </div>
              ) : (
                filteredActors.map((actor) => (
                  <div key={actor._id} className="col-6 col-sm-4 col-lg-3 col-xl-2">
                    <div className="item">
                      <div className="item__cover">
                        <img 
                          src={actor.imageUrl || '/admin/img/placeholder.jpg'} 
                          alt={actor.name}
                        />
                        <a href={`/actor/${actor.slug}`} className="item__play">
                          <i className="ti ti-user"></i>
                        </a>
                      </div>
                      <div className="item__content">
                        <h3 className="item__title">
                          <a href={`/actor/${actor.slug}`}>{actor.name}</a>
                        </h3>
                        <span className="item__category">
                          <a href="#">{actor.career}</a>
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
