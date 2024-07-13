// Note: didn't use this file; instead, added schedule details directly in Home.tsx

import React, { useEffect, useState } from 'react';

interface ScheduleDisplayProps {
  scheduleId: number;
}

const ScheduleDetails: React.FC<ScheduleDisplayProps> = ({ scheduleId }) => {
  const [schedule, setSchedule] = useState<unknown | null>(null);

  useEffect(() => {
    // TODO: Fetch the schedule, etc.
    // setSchedule(...);
  }, [scheduleId]);

  if (!schedule) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>Schedule {schedule.id}</h2>
      {/* TODO: Display the assigned shifts in the schedule */}
    </div>
  );
};

export default ScheduleDetails;
