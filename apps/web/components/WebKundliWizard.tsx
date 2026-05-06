'use client';

import { useEffect, useMemo, useState } from 'react';
import { composeDestinyPassport } from '@pridicta/astrology';
import type { BirthDetails, KundliData } from '@pridicta/types';
import { WEB_BIRTH_PLACES } from '../lib/birth-places';
import {
  generateKundliFromWeb,
  loadWebKundli,
} from '../lib/web-kundli-storage';
import { WebDestinyPassportCard } from './WebDestinyPassportCard';
import { WebKundliChart } from './WebKundliChart';

export function WebKundliWizard(): React.JSX.Element {
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [placeIndex, setPlaceIndex] = useState(0);
  const [isApproximate, setIsApproximate] = useState(false);
  const [kundli, setKundli] = useState<KundliData | undefined>();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const place = WEB_BIRTH_PLACES[placeIndex] ?? WEB_BIRTH_PLACES[0];
  const details = useMemo<BirthDetails>(
    () => ({
      date,
      isTimeApproximate: isApproximate,
      latitude: place.latitude,
      longitude: place.longitude,
      name: name.trim(),
      place: place.place,
      resolvedBirthPlace: {
        city: place.label.split(',')[0],
        country: place.place.split(',').at(-1)?.trim() ?? place.place,
        latitude: place.latitude,
        longitude: place.longitude,
        source: 'local-dataset',
        timezone: place.timezone,
      },
      time,
      timezone: place.timezone,
    }),
    [date, isApproximate, name, place, time],
  );

  useEffect(() => {
    setKundli(loadWebKundli());
  }, []);

  async function generate() {
    setError(undefined);

    if (!name.trim() || !date || !time) {
      setError('Please fill name, birth date, and birth time first.');
      return;
    }

    try {
      setIsGenerating(true);
      setKundli(await generateKundliFromWeb(details));
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : 'Kundli calculation failed. Please check the details.',
      );
    } finally {
      setIsGenerating(false);
    }
  }

  function fillExample() {
    setName('Aarav');
    setDate('2012-08-16');
    setTime('06:42');
    setPlaceIndex(0);
    setIsApproximate(false);
  }

  return (
    <div className="kundli-wizard">
      <section className="kundli-wizard-card glass-panel">
        <div className="section-title">STEP 1 · CREATE KUNDLI</div>
        <h2>Enter birth details in order.</h2>
        <p>
          Predicta needs only three things first: date, time, and place. The
          technical coordinates stay hidden.
        </p>

        <div className="kundli-form-grid">
          <label>
            <span>Name</span>
            <input
              onChange={event => setName(event.target.value)}
              placeholder="Your name"
              value={name}
            />
          </label>
          <label>
            <span>Birth date</span>
            <input
              onChange={event => setDate(event.target.value)}
              type="date"
              value={date}
            />
          </label>
          <label>
            <span>Birth time</span>
            <input
              onChange={event => setTime(event.target.value)}
              type="time"
              value={time}
            />
          </label>
          <label>
            <span>Birth place</span>
            <select
              onChange={event => setPlaceIndex(Number(event.target.value))}
              value={placeIndex}
            >
              {WEB_BIRTH_PLACES.map((option, index) => (
                <option key={option.place} value={index}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="kundli-checkbox">
          <input
            checked={isApproximate}
            onChange={event => setIsApproximate(event.target.checked)}
            type="checkbox"
          />
          Birth time is approximate
        </label>

        {error ? <p className="form-error">{error}</p> : null}

        <div className="action-row">
          <button
            className="button"
            disabled={isGenerating}
            onClick={generate}
            type="button"
          >
            {isGenerating ? 'Calculating...' : 'Generate Kundli'}
          </button>
          <button className="button secondary" onClick={fillExample} type="button">
            Fill Example
          </button>
        </div>
      </section>

      {kundli ? (
        <section className="kundli-ready-flow">
          <div className="plain-summary glass-panel">
            <div className="section-title">STEP 2 · SIMPLE SUMMARY</div>
            <h2>Your kundli is ready.</h2>
            <p>
              Start here before opening advanced tools. Rising sign means your
              starting style. Moon sign means your emotional pattern. Dasha means
              the current life chapter.
            </p>
            <div className="plain-summary-grid">
              <div>
                <span>Rising sign</span>
                <strong>{kundli.lagna}</strong>
              </div>
              <div>
                <span>Moon pattern</span>
                <strong>{kundli.moonSign}</strong>
              </div>
              <div>
                <span>Life chapter</span>
                <strong>
                  {kundli.dasha.current.mahadasha}/{kundli.dasha.current.antardasha}
                </strong>
              </div>
            </div>
          </div>

          <WebDestinyPassportCard passport={composeDestinyPassport(kundli)} />
          <div className="glass-panel kundli-chart-panel">
            <WebKundliChart chart={kundli.charts.D1} />
          </div>
        </section>
      ) : null}
    </div>
  );
}
