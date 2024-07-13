import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import * as api from '../services/apiService';
import { useNavigate } from 'react-router-dom';

const NurseDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [preferences, setPreferences] = useState<Record<string, string[]>>({});
    const navigate = useNavigate();

    // Get latest preferences for every nurse
    useEffect(() => {
        const fetchNurseById = async () => {
            try {
                const data = await api.default.getNurseById(Number(id));

                // Extract preferences and format them properly
                const transformedPreferences: Record<string, string[]> = data.preferences
                    ? data.preferences.reduce(
                        (result: Record<string, string[]>, { day, shift }: { day: string; shift: string }) => {
                            if (!result[shift]) {
                                result[shift] = [];
                            }
                            result[shift].push(day);
                            return result;
                        },
                        {}
                    )
                    : {};

                // Set the state with the latest preferences
                setPreferences(transformedPreferences);
            } catch (error) {
                console.error(error);
            }
        };

        fetchNurseById();
    }, [id]);

    // Update checkboxes and preferences whenever user selects a preference
    const handleCheckboxChange = (day: string, shift: string) => {
        setPreferences((prevPreferences) => {
            const updatedPreferences = { ...prevPreferences };
            if (!updatedPreferences[shift]) {
                updatedPreferences[shift] = [];
            }

            if (updatedPreferences[shift].includes(day)) {
                updatedPreferences[shift] = updatedPreferences[shift].filter((d) => d !== day);
            } else {
                updatedPreferences[shift] = [...updatedPreferences[shift], day];
            }

            return updatedPreferences;
        });
    };

    // When nurse submits preferences, make an api call to update this nurse's preferences, and generate a new schedule 
    // for all nurses 
    const handleSubmit = async () => {
        try {
            const today = new Date();
            const startOfWeek = today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1);
            const startDate = new Date(today.setDate(startOfWeek));

            // Set endDate to upcoming Sunday
            const endOfWeek = startOfWeek + 6;
            const endDate = new Date(today.setDate(endOfWeek));

            // Convert preferences to match the desired JSON schema
            const formattedPreferences = Object.entries(preferences)
                .flatMap(([shift, days]) => days.map((day) => ({ day, shift })));
            console.log("formatted preferences:", formattedPreferences)
            await api.default.setNursePreferences(Number(id), JSON.stringify(formattedPreferences));
            await api.default.generateSchedule(startDate, endDate);

            navigate('/'); // after submitting, take the user back to the home page
        } catch (error) {
            console.error('Error saving nurse preferences:', error);
        }
    };

    return (
        <div>
            <h1>Nurse Details</h1>
            <p>Nurse ID: {id}</p>

            <table style={{ marginBottom: '20px' }}>
                <thead>
                    <tr>
                        <th>Day</th>
                        <th>Shift</th>
                        <th>Preference</th>
                    </tr>
                </thead>
                <tbody>
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                        <tr key={day}>
                            <td>{day}</td>
                            <td>
                                <label>
                                    Day Shift
                                    <input
                                        type="checkbox"
                                        checked={preferences.day?.includes(day)}
                                        onChange={() => handleCheckboxChange(day, 'day')}
                                    />
                                </label>
                            </td>
                            <td>
                                <label>
                                    Night Shift
                                    <input
                                        type="checkbox"
                                        checked={preferences.night?.includes(day)}
                                        onChange={() => handleCheckboxChange(day, 'night')}
                                    />
                                </label>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <button onClick={handleSubmit}>Submit</button>
            <button onClick={() => navigate('/')}>Back</button>
        </div>
    );
};

export default NurseDetails;
