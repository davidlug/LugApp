import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from 'react-router-dom';

const TeamListing = () => {
    const { leagueID } = useParams(); // Extract leagueID from the URL
    const [teamdata, setTeamData] = useState(null);
    const navigate = useNavigate();

    const LoadDetail = (id) => {
        navigate(`/league/${leagueID}/team/detail/${id}`);
    }
    
    const LoadEdit = (id) => {
        navigate(`/league/${leagueID}/team/edit/${id}`);
    }

    useEffect(() => {
        fetch("http://localhost:8080/getTeams")
            .then((res) => res.json())
            .then((resp) => setTeamData(resp))
            .catch((err) => console.log(err.message));
    }, []);

    return (
        <div className="container">
            <div className="card">
                <div className="card-title">
                    <h2>Team Listing</h2>
                </div>
                <div className="card-body">
                    <div>
                        <Link to={`/league/${leagueID}/division/team`} className="btn btn-success">Add New (+)</Link>
                    </div>
                    <table className="table table-bordered">
                        <thead className="bg-dark text-white">
                            <tr>
                                <td>Team ID</td>
                                <td>Team Name</td>
                                <td>Skill Level</td>
                                <td>Number of Players</td>
                                <td>Action</td>
                            </tr>
                        </thead>
                        <tbody>
                            {teamdata && teamdata.teams ? (
                                teamdata.teams.map(item => (
                                    <tr key={item.id}>
                                        <td>{item.id}</td>
                                        <td>{item.teamName}</td>
                                        <td>{item.Division}</td>
                                        <td>{item.Players}</td>
                                        <td>
                                            <button className="btn btn-success" onClick={() => LoadEdit(item.id)}>Edit</button>
                                            <button className="btn btn-danger">Remove</button>
                                            <button className="btn btn-primary" onClick={() => LoadDetail(item.id)}>Details</button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5">No team data available</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default TeamListing;
