import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import './Divisions.css';
import lugLogo from './lugLogo.png';

const LeagueEdit = () => {
    const { id } = useParams();

    const [divisionData, setDivisionData] = useState([]);
    const [divisionName, setDivisionName] = useState("");
    const [leagueName, setLeagueName] = useState("");
    const navigate = useNavigate();
    
    useEffect(() => {
        fetch(`http://localhost:8080/divisions/${id}`)
            .then((res) => res.json())
            .then((resp) => {
                setDivisionData(resp.divisions);
                setLeagueName(resp.leagueName);
                setDivisionName()
            })
            .catch((err) => {
                console.log(err.message);
            });
    }, [id]);

    return (
        <div style={{ position: 'relative', alignItems: 'center', top: '20%', display: 'flex', flexDirection: 'column', textAlign: 'center' }}>
            <img src={lugLogo} width={250} alt="Lug Logo" />
            <h1 style={{ marginTop: '25px' }}>{leagueName}</h1>
            <table>
                <thead>
                    <tr>
                        <th>Division</th>
                        <th>Number of Teams</th>
                    </tr>
                </thead>
                <tbody>
                    {divisionData.length > 0 ? (
                        divisionData.map((division) => (
                            <tr key={division.divisionID}>
                                <td>{division.divisionName}</td>
                                <td>{division.teams ? division.teams.length : 0}</td>  
                                <td>
                                <button onClick={() => navigate(`/teams/${division.divisionID}/league/${id}`)} className="btn btn-success">View Teams</button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="3">No division data available</td>
                        </tr>
                    )}
                </tbody>
            </table>
            <div>
                <Link to={`/league/${id}/create`} className="btn btn-success">Add New Division (+)</Link>
                <Link to={`/`} className="btn btn-danger">Back</Link>
            </div>
        </div>
    );
}

export default LeagueEdit;
