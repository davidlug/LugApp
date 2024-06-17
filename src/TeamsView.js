import './schedule.css';
import { useEffect, useState, React, useRef } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import './Teams.css';
import lugLogo from './lugLogo.png';
import * as XLSX from 'xlsx';
import Slider from '@mui/material/Slider';
import { DownloadTableExcel } from 'react-export-table-to-excel';
import * as FileSaver from 'file-saver';
import XSLX from 'sheetjs-style';
import { Tooltip } from 'bootstrap';
import ExportAsExcel from 'react-export-table-to-excel'


const TeamsView = () => {
    const { leagueID, divisionID } = useParams();
    const [divisionName, setDivisionName] = useState("");
    const [teams, setTeams] = useState([]);
    const navigate = useNavigate();
    const [timeslots, setTimeSlots] = useState([]);
    const [data, setData] = useState("");
    const [generatedSchedule, setGeneratedSchedule] = useState([]);
    const [value, setValue] = useState(0.1);
    const [selectedWeeks, setSelectedWeeks] = useState([]); // State for selected weeks
    const tableRef = useRef(null);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const fileType = `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset-UTF-8`;
    const fileExtension = '.xlsx';

    const exportToExcel = async(excelData, fileName) => {
        console.log(excelData);
        const ws = XLSX.utils.json_to_sheet(excelData);
        const wb = {Sheets: {'data':ws}, SheetNames:['data']};
        const excelBuffer = XLSX.write(wb, {bookType: 'xlsx', type: 'array'});
        const data = new Blob([excelBuffer],{type: fileType});
        FileSaver.saveAs(data, fileName + fileExtension);
    }

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();

        reader.onload = (event) => {
            const workbook = XLSX.read(event.target.result, { type: 'binary' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const sheetData = XLSX.utils.sheet_to_json(sheet);

            fetch(`http://localhost:8080/league/${leagueID}/division/${divisionID}/teams`, {
                method: "POST",
                headers: { "Content-type": "application/json" },
                body: JSON.stringify(sheetData)
            }).then(response => response.json())
                .then(data => {
                    console.log('Success:', data);
                    alert("Teams successfully added");
                    window.location.reload();
                })
                .catch(error => {
                    console.error('Error:', error);
                });
        };

        reader.readAsBinaryString(file);
    };

    const timeslotFileUpload = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();

        reader.onload = (event) => {
            const workbook = XLSX.read(event.target.result, { type: 'binary' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const sheetData = XLSX.utils.sheet_to_json(sheet);
            console.log(sheetData);
            const formattedData = sheetData.map(item => {
                const date = ExcelDateToJSDate(item.date);
                const startTime = ExcelDateToJSDate(item.startTime);
                const endTime = ExcelDateToJSDate(item.endTime);

                return {
                    ...item,
                    date: formatDate(date),
                    startTime: formatTime(startTime),
                    endTime: formatTime(endTime)
                };
            });

            fetch(`http://localhost:8080/league/${leagueID}/division/${divisionID}/timeslots`, {
                method: "POST",
                headers: { "Content-type": "application/json" },
                body: JSON.stringify(formattedData)
            }).then(response => response.json())
                .then(data => {
                    console.log('Success:', data);
                    alert("Timeslots successfully added");
                    window.location.reload();
                })
                .catch(error => {
                    console.error('Error:', error);
                });

            setData(formattedData);
        };
        reader.readAsBinaryString(file);
    }

    const ExcelDateToJSDate = (serial) => {
        const utc_days = Math.floor(serial - 25569);
        const utc_value = utc_days * 86400;
        const date_info = new Date(utc_value * 1000);

        const fractional_day = serial - Math.floor(serial) + 0.0000001;

        let total_seconds = Math.floor(86400 * fractional_day);
        const seconds = total_seconds % 60;

        total_seconds -= seconds;
        const hours = Math.floor(total_seconds / (60 * 60));
        const minutes = Math.floor(total_seconds / 60) % 60;

        date_info.setHours(hours);
        date_info.setMinutes(minutes);
        date_info.setSeconds(seconds);

        return date_info;
    };

    const formatTime = (date) => {
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const formattedHours = hours % 12 || 12;
        const formattedMinutes = minutes.toString().padStart(2, '0');
        return `${formattedHours}:${formattedMinutes} ${ampm}`;
    };

    const formatDate = (date) => {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const formatBoolean = (value) => {
        return value ? "Yes" : "No";
    }

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
    }, [leagueID, divisionID]);

    useEffect(() => {
        fetch(`http://localhost:8080/leagues/${leagueID}/divisions/${divisionID}/timeslots`)
            .then((res) => res.json())
            .then((resp) => {
                setTimeSlots(resp.timeslots || []);
            })
            .catch((err) => {
                console.log(err.message);
            });
    }, [leagueID, divisionID]);

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
                console.log(err.message);
            });
        }
    };

    const fetchLeagues = (value) => {
        console.log("Selected");
        console.log(selectedWeeks);
        fetch(`http://localhost:8080/league/${leagueID}/division/${divisionID}/schedule?freezeWeeks=${selectedWeeks}`)
            .then((res) => res.json())
            .then((resp) => {
                setGeneratedSchedule(resp.schedule || []);
            })
            .catch((err) => {
                console.log(err.message);
            });
    };

    const toggleWeekSelection = (week) => {
        setSelectedWeeks(prevSelectedWeeks =>
            prevSelectedWeeks.includes(week)
                ? prevSelectedWeeks.filter(w => w !== week)
                : [...prevSelectedWeeks, week]
        );
    };

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
                                    <Link to={`/league/${leagueID}/division/${divisionID}/team/${team.id}`} className="btn btn-primary">Edit Team</Link>
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

            <div>
                <input type="file" onChange={handleFileUpload} />
            </div>

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
                        <th>Premium Facility?</th>
                        <th>Late Game?</th>
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
                                <td>{formatBoolean(timeslot.premium)}</td>
                                <td>{formatBoolean(timeslot.lateGame)}</td>
                                <td><Link to={`/league/${leagueID}/division/${divisionID}/timeslot/${timeslot.id}`} className="btn btn-primary">Edit Timeslot</Link></td>
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
                <input type="file" onChange={timeslotFileUpload} />
                {data && (
                    <div>
                        <h2>Imported Data:</h2>
                        <pre>{JSON.stringify(data, null, 2)}</pre>
                    </div>
                )}
            </div>

            <div>
                <Slider
                    aria-label="timeslotBalance"
                    value={value}
                    onChange={handleChange}
                    min={0.1}
                    max={30}
                    step={0.1}
                    sx={{
                        width: 300,
                        color: '#FFA500',
                        '& .MuiSlider-thumb': {
                            backgroundColor: '#FF8C00',
                        },
                        '& .MuiSlider-track': {
                            backgroundColor: '#FFA500',
                        },
                        '& .MuiSlider-rail': {
                            backgroundColor: 'rgb(255, 223, 186)',
                        },
                    }}
                />
                <div>Schedule Balance Threshold: {value}</div>
            </div>

            <div>
                <button className="btn btn-success" type="button" onClick={() => fetchLeagues(value)}>Generate Schedule</button>
            </div>

            <div>
                <div className="week-buttons">
                    <div>
                        <h2>Lock Weeks:</h2>

                    </div>
                    {generatedSchedule.map((_, weekIndex) => (
                        <button
                            key={weekIndex}
                            onClick={() => toggleWeekSelection(weekIndex + 1)}
                            className={`btn ${selectedWeeks.includes(weekIndex + 1) ? 'btn-primary' : 'btn-secondary'}`}
                        >
                            Week {weekIndex + 1}
                        </button>
                    ))}
                </div>
            </div>

            <div>
            <h2>Schedule</h2>
            <table className='scheduleTable' >
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

            
            <div>
                <button className="btn btn-danger" type="button" onClick={handleBack}>Back</button>
            </div>
        </div>
    );
}

export default TeamsView;
