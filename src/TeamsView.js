import './schedule.css';
import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import './Teams.css';
import lugLogo from './lugLogo.png';

class Matchup {
    constructor(homeTeam, awayTeam) {
        this.homeTeam = homeTeam;
        this.awayTeam = awayTeam;
    }
}

const TeamsView = () => {
    const { leagueID, divisionID } = useParams();
    const [divisionName, setDivisionName] = useState("");
    const [teams, setTeams] = useState([]);
    const [showNewTable, setShowNewTable] = useState(false);
    const navigate = useNavigate();
    const [timeslots, setTimeSlots] = useState([]);
    const [generatedSchedule, setGeneratedSchedule] = useState([]);

    useEffect(() => {
        fetch(`http://localhost:8080/leagues/${leagueID}/divisions/${divisionID}/teams`)
            .then((res) => res.json())
            .then((resp) => {
                setDivisionName(resp.divisionName);
                setTeams(resp.teams || []);
            })
            .catch((err) => {
                console.log(err.message);
            });
    }, [leagueID, divisionID]); // Add leagueID and divisionID as dependencies

    useEffect(() => {
        fetch(`http://localhost:8080/leagues/${leagueID}/divisions/${divisionID}/timeslots`)
            .then((res) => res.json())
            .then((resp) => {
                setTimeSlots(resp.timeslots || []);
            })
            .catch((err) => {
                console.log(err.message);
            });
    }, [leagueID, divisionID]); // Add leagueID and divisionID as dependencies

    const handleBack = () => {
        navigate(-1);
    };

    const RemoveTeam = (leagueID, divisionID, teamID, teamName) => {
        if (window.confirm("Do you want to delete " + teamName + "?")) {
            fetch(`http://localhost:8080/leagues/${leagueID}/divisions/${divisionID}/teams/${teamID}`, {
                method: "DELETE",
            }).then((res) => {
                alert("Team deleted successfully.");
                window.location.reload();
            }).catch((err) => {
                console.log(err.message)
            })
        }
    }

    const displayTable = () => {
        setShowNewTable(true);
    }

    const generateScheduleAlgorithm = (matchups, scheduleByWeeks, teamSet) => {
        let seasonMatchups = [...matchups];

        for (let k = 0; k < scheduleByWeeks.length; k++) {
            let weekMatchups = [...seasonMatchups];
            let teamCopy = [...teamSet];

            for (let i = 0; i < scheduleByWeeks[k].length; i++) {
                if (weekMatchups.length === 0) {
                    return scheduleByWeeks;
                }

                let index = Math.floor(Math.random() * weekMatchups.length);
                let chosenMatch = weekMatchups[index];
                scheduleByWeeks[k][i].match = chosenMatch;

                teamSet = teamSet.filter(team =>
                    ![chosenMatch.homeTeam, chosenMatch.awayTeam].includes(team)
                );

                weekMatchups = weekMatchups.filter(match =>
                    ![chosenMatch.homeTeam, chosenMatch.awayTeam].includes(match.awayTeam) &&
                    ![chosenMatch.homeTeam, chosenMatch.awayTeam].includes(match.homeTeam)
                );

                seasonMatchups = seasonMatchups.filter(match =>
                    !(
                        (match.homeTeam === chosenMatch.homeTeam && match.awayTeam === chosenMatch.awayTeam) ||
                        (match.homeTeam === chosenMatch.awayTeam && match.awayTeam === chosenMatch.homeTeam)
                    )
                );
            }

            teamSet = [...teamCopy];
        }

        return scheduleByWeeks;
    }

    const generateSchedule = () => {
        var teamCopy = teams.map(team => ({ ...team, weight: 0 }));
        var matchups = matchupGenerator(teamCopy);
        var scheduleByWeeks = [];
        for (var i = 0; i < timeslots[timeslots.length - 1].week; i++) {
            scheduleByWeeks.push([]);
        }
        for (var j = 0; j < timeslots.length; j++) {
            scheduleByWeeks[timeslots[j].week - 1].push(timeslots[j]);
        }

        for (var i = 0; i < scheduleByWeeks.length; i++) {
            scheduleByWeeks[i].sort((a, b) => {
                const [aHours, aMinutes] = a.startTime.split(':').map(Number);
                const [bHours, bMinutes] = b.startTime.split(':').map(Number);

                if (aHours === bHours) {
                    return aMinutes - bMinutes;
                }
                return aHours - bHours;
            });
            for (var j = 0; j < scheduleByWeeks[i].length; j++) {
                scheduleByWeeks[i][j].weight = j;
            }
        }
        var returnSchedule = generateScheduleAlgorithm(matchups, scheduleByWeeks, teams);

        let goodSchedule = false;
        while (!goodSchedule) {
            goodSchedule = true;
            for (let k = 0; k < returnSchedule.length; k++) {
                for (let i = 0; i < returnSchedule[k].length; i++) {
                    if (returnSchedule[k][i].match == null) {
                        returnSchedule = generateScheduleAlgorithm(matchups, scheduleByWeeks, teams);
                        goodSchedule = false;
                        break;
                    }
                }
                if (!goodSchedule) {
                    break;
                }
            }
        }

        let balancedSchedule = false;
        let dupeTeam = true;

        if (goodSchedule == true) {
            while (balancedSchedule == false) {
                for (var k = 0; k < returnSchedule.length; k++) {
                    for (var i = 0; i < returnSchedule[k].length; i++) {
                        for (var p = 0; p < teamCopy.length; p++) {
                            if (teamCopy[p].teamName.valueOf() == returnSchedule[k][i].match.homeTeam.teamName.valueOf() || teamCopy[p].teamName.valueOf() == returnSchedule[k][i].match.awayTeam.teamName.valueOf()) {
                                teamCopy[p].weight += returnSchedule[k][i].weight;
                            }
                        }
                    }
                }

                var weights = [];
                for (var r = 0; r < teamCopy.length; r++) {
                    weights.push(teamCopy[r].weight / (returnSchedule.length - 2));
                }
                var minWeight = weights[0];
                var maxWeight = weights[0];
                for (var l = 1; l < weights.length; l++) {
                    if (weights[l] < minWeight) {
                        minWeight = weights[l];
                    }
                    if (weights[l] > maxWeight) {
                        maxWeight = weights[l];
                    }
                }
                if (maxWeight - minWeight > 0.35) {
                    for (var a = 0; a < teamCopy.length; a++) {
                        teamCopy[a].weight = 0;
                    }
                    returnSchedule = generateScheduleAlgorithm(matchups, scheduleByWeeks, teams);
                } else {
                    balancedSchedule = true;
                }
            }
        }

        while (dupeTeam == true) {
            dupeTeam = false;
            for (var k = 0; k < returnSchedule.length; k++) {
                var teamsCopy = [];
                for (var i = 0; i < returnSchedule[k].length; i++) {
                    teamsCopy.push(returnSchedule[k][i].match.awayTeam.teamName);
                    teamsCopy.push(returnSchedule[k][i].match.homeTeam.teamName);
                }
                var s = new Set();
                for (let teamName of teamsCopy) {
                    if (s.has(teamName)) {
                        dupeTeam = true;
                        break;
                    } else {
                        s.add(teamName);
                    }
                }
                if (dupeTeam == true) {
                    returnSchedule = generateScheduleAlgorithm(matchups, scheduleByWeeks, teams);
                }
            }
        }

        setGeneratedSchedule(returnSchedule);
    }

    const matchupGenerator = (teams) => {
        let matchups = [];
        for (var i = 0; i < teams.length; i++) {
            var homeTeam = teams[i];
            for (var j = 0; j < teams.length; j++) {
                if (i !== j) {
                    var awayTeam = teams[j];
                    matchups.push(new Matchup(homeTeam, awayTeam));
                }
            }
        }
        return matchups;
    }

    return (
        <div style={{ position: 'relative', alignItems: 'center', top: '20%', display: 'flex', flexDirection: 'column', textAlign: 'center' }}>
            <img src={lugLogo} width={250} alt="Lug Logo" />
            <h1 style={{ marginTop: '25px' }}>{divisionName} Teams</h1>
            <table>
                <thead>
                    <tr>
                        <th>Team Name</th>
                        <th>Number of Players</th>
                        <th>Sub-Division</th>
                    </tr>
                </thead>
                <tbody>
                    {teams.length > 0 ? (
                        teams.map(team => (
                            <tr key={team.id}>
                                <td>{team.teamName}</td>
                                <td>{team.Players}</td>
                                <td>{team.Division}</td>
                                <td>
                                    <a onClick={() => { RemoveTeam(leagueID, divisionID, team.id, team.teamName) }} className="btn btn-danger">Remove</a>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="3">No teams available</td>
                        </tr>
                    )}
                </tbody>
            </table>
            <Link to={`/league/${leagueID}/division/${divisionID}/team`} className="btn btn-success">Add New Team (+)</Link>
            <h1>Time Slots</h1>
            <table>
                <thead>
                    <tr>
                        <th>Week</th>
                        <th>Date</th>
                        <th>Start Time</th>
                        <th>End Time</th>
                        <th>Facility</th>
                        <th>Rink</th>
                    </tr>
                </thead>
                <tbody>
                    {timeslots.length > 0 ? (
                        timeslots.map(timeslot => (
                            <tr key={timeslot.id}>
                                <td>{timeslot.week}</td>
                                <td>{timeslot.date}</td>
                                <td>{timeslot.startTime}</td>
                                <td>{timeslot.endTime}</td>
                                <td>{timeslot.facility}</td>
                                <td>{timeslot.rink}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="6">No timeslots available</td>
                        </tr>
                    )}
                </tbody>
            </table>
            <Link to={`/league/${leagueID}/division/${divisionID}/timeslot`} className="btn btn-success">Add New Timeslot (+)</Link>

            <div>
                <button className="btn btn-success" type="button" onClick={generateSchedule}>Generate Schedule</button>
            </div>
            {generatedSchedule.length > 0 && (
                <div>
                    <h2>Schedule</h2>
                    <table className='scheduleTable'>
                        <thead>
                            <tr>
                                <th>Week</th>
                                <th>Date</th>
                                <th>Start Time</th>
                                <th>End Time</th>
                                <th>Home Team</th>
                                <th>Away Team</th>
                            </tr>
                        </thead>
                        <tbody>
                            {generatedSchedule.map((week, weekIndex) => (
                                <>
                                    <tr key={`divider-${weekIndex}`} className="divider">
                                        <td colSpan="6">Week {weekIndex + 1}</td>
                                    </tr>
                                    {week.map((timeslot, timeslotIndex) => (
                                        <tr key={`${weekIndex}-${timeslotIndex}`}>
                                            <td>{timeslot.week}</td>
                                            <td>{timeslot.date}</td>
                                            <td>{timeslot.startTime}</td>
                                            <td>{timeslot.endTime}</td>
                                            <td>{timeslot.match ? timeslot.match.homeTeam.teamName : 'TBD'}</td>
                                            <td>{timeslot.match ? timeslot.match.awayTeam.teamName : 'TBD'}</td>
                                        </tr>
                                    ))}
                                </>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            <div>
                <button className="btn btn-danger" type="button" onClick={handleBack}>Back</button>
            </div>
        </div>
    );
}

export default TeamsView;
