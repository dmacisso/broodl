'use client';

import { Fugaz_One } from 'next/font/google';
import Calendar from './Calendar';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { count, doc, setDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import Login from './Login';
import Loading from './Loading';

const fugaz = Fugaz_One({ subsets: ['latin'], weight: ['400'] });

export default function Dashboard() {
  const { currentUser, userDataObj, setUserDataObj, loading } = useAuth();
  const [data, setData] = useState({});
  const now = new Date();
  //* MARK: Functions

  function countValues() {
    let total_number_days = 0;
    let sum_moods = 0;
    for (let year in data) {
      for (let month in data[year]) {
        for (let day in data[year][month]) {
          let days_mood = data[year][month][day];
          total_number_days++;
          sum_moods += days_mood;
        }
      }
    }
    return {
      num_days: total_number_days,
      average_mood: sum_moods / total_number_days,
    };
  }

  const statuses = {
    ...countValues(),
    // num_days: 14,
    // average_mood: new Date().toDateString(),
    time_remaining: `${23 - now.getHours()}H ${60 - now.getMinutes()}M`,
  };

  async function handleSetMood(mood) {
    const day = now.getDate();
    const month = now.getMonth();
    const year = now.getFullYear();

    try {
      const newData = { ...userDataObj };
      if (!newData?.[year]) newData[year] = {};
      if (!newData?.[year]?.[month]) newData[year][month] = {};
      newData[year][month][day] = mood;
      //* update the current state (mood in the user data)
      setData(newData);
      //* update the global state (user data)
      setUserDataObj(newData);

      //* update the firestore (user data)

      const docRef = doc(db, 'users', currentUser.uid);
      const res = await setDoc(
        docRef,
        {
          [year]: {
            [month]: {
              [day]: mood,
            },
          },
        },
        { merge: true }
      );
    } catch (error) {
      console.error('Failed to set data: ', error.message);
    }
  }
  // MARK: MOODS

  const moods = {
    '&*@#$': '😭',
    Sad: '😢',
    Existing: '😗',
    Good: '😊',
    Elated: '😍',
  };

  useEffect(() => {
    if (!currentUser || !userDataObj) return;
    setData(userDataObj);
  }, [currentUser, userDataObj]);

  if (loading) return <Loading />;

  if (!currentUser) return <Login />;

  return (
    <div className="flex flex-col flex-1 gap-8 sm:gap-12 md:gap-16">
      <div className="grid grid-cols-3 bg-indigo-50 text-indigo-500 p-4 gap-4 rounded-lg">
        {Object.keys(statuses).map((status, statusIndex) => {
          return (
            <div className=" flex  flex-col gap-1 sm:gap-2" key={statusIndex}>
              <p className="font-medium capitalize text-xs sm:text-sm truncate">
                {status.replaceAll('_', ' ')}
              </p>
              <p className={'text-base sm:text-lg ' + fugaz.className}>
                {statuses[status]}
                {status === 'num_days' ? ' 🔥' : ''}
              </p>
            </div>
          );
        })}
      </div>
      <h4
        className={
          'text-5xl sm:text-6xl  md:text-7xl text-center ' + fugaz.className
        }
      >
        How do you <span className="textGradient">feel</span> today?
      </h4>

      {/* MARK: Buttons */}
      <div className="flex items-stretch flex-wrap  gap-4 sm:grid-cols-5 ">
        {Object.keys(moods).map((mood, moodIndex) => {
          // if (loading) {
          //   return <Loading key={moodIndex} />;
          // }

          // if (!currentUser) {
          //   return <Login key={moodIndex} />;
          // }

          return (
            <button
              onClick={() => {
                const currentMoodValue = moodIndex + 1;
                handleSetMood(currentMoodValue);
              }}
              className={
                'p-4 px-5 rounded-2xl purpleShadow duration-200 bg-indigo-50 hover:bg-indigo-100 text-center flex flex-col items-center gap-2 flex-1 ' +
                (moodIndex === 4 ? 'col-span-2 sm:col-span-1' : ' ')
              }
              key={moodIndex}
            >
              <p className="text-4xl sm:text-5xl md:text-6xl">{moods[mood]}</p>
              <p
                className={
                  'text-indigo-500 text-xs sm:text-sm md:text-base ' +
                  fugaz.className
                }
              >
                {mood}
              </p>
            </button>
          );
        })}
      </div>
      <Calendar completeData={data} handleSetMood={handleSetMood} />
    </div>
  );
}
