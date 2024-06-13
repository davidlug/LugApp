import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

const TeamEdit = () => {
    const {leagueID} = useParams();
    const {divisionID} = useParams();
    const {teamID} = useParams();

    const[teamName, teamNameChange] = useState("");
    const[players, playersChange] = useState();
    const[division, divisionChange] = useState();

    useEffect(() => {
        fetch(`http://localhost:8080/league/${leagueID}/division/${divisionID}/team/${teamID}`).then((res) => {
            return res.json()
        }).then((resp) => {
            teamNameChange(resp.teamName);
            playersChange(resp.Players);
            divisionChange(resp.Division);
        })
        
    }

    );




    return (
        <div>
            <h1>Hello</h1>
        </div>
    )
}

export default TeamEdit;