import {Link, useNavigate, useParams} from 'react-router-dom';
import { useState } from 'react';

const TeamCreate = () => {
    const{leagueID} = useParams();
    const{divisionID} = useParams();

    const[id,idChange]=useState("");
    const[teamName,teamNameChange]=useState("");
    const[Players,PlayersChange]=useState("");
    const[Division,divisionChange]=useState("");
    const navigate=useNavigate();


    const handlesubmit=(e)=>{
        e.preventDefault();
        const teamData = {teamName,Players,Division};
        console.log("Submitted data: "+teamData);
        fetch(`http://localhost:8080/league/${leagueID}/division/${divisionID}/team`,{
            method:"POST",
            headers:{"Content-type":"application/json"},
            body:JSON.stringify(teamData)
        }).then((res)=>{
            return res.json();
        }).then((data)=>{
            alert("Team saved successfully.")
            console.log("Response Data: "+data)
            navigate(-1)
        }).catch((err)=>{
            console.log(err.message)
        })
        
    }

    const handleBack = () => {
        navigate(-1); // Navigate to the previous page
    };

    const handleChange=(e)=>{
        this.setState({selectValue:e.target.value});
    }


    return (
        <div>
            <div className="row">
                <div className="offset-lg-3 col-lg-6">
                    <form className="container" onSubmit={handlesubmit}>
                        <div className="card" style={{"textAlign":"left"}}>
                            <div className="card=title">
                                <h2>Add Team</h2>
                            </div>
                            <div className="card-body">
                                <div className="row">
                                    <div className="col-lg-12">
                                        <div className="form-group">
                                            <label>Team Name</label>
                                            <input value = {teamName} onChange={e=>teamNameChange(e.target.value)} className="form-control"></input>
                                        </div>
                                    </div>

                                    <div className="col-lg-12">
                                        <div className="form-group">
                                            <label>Sub-Division</label>
                                            <select value={Division} onChange={e => divisionChange(e.target.value)} className="form-control">
                                                <option value="">Choose Sub-Division</option>
                                                <option value="Elite">Elite</option>
                                                <option value="A">A</option>
                                                <option value="B">B</option>
                                                <option value="C">C</option>
                                                <option value="D">D</option>
                                                <option value="W">W</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="col-lg-12">
                                        <div className="form-group">
                                            <label>Number of Players</label>
                                            <input value={Players} onChange={e=>PlayersChange(e.target.value)} className="form-control"></input>
                                        </div>
                                    </div>

                                    <div className="col-lg-12">
                                        <div className="form-group">
                                            <button className="btn btn-success" type="submit">Save</button>
                                            <button className="btn btn-success" type="back" onClick={handleBack}>Back</button>
                                        </div>
                                    </div>
                                    
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default TeamCreate;