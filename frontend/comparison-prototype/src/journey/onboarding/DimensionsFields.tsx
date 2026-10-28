import { useState } from 'react'
import { BOARD_LENGTH_OPTIONS, BOARD_VOLUME_OPTIONS } from '../../logic/questions'
import type { DimensionsAnswer } from '../../logic/answers'
import { ModeToggle } from './ModeToggle'

/**
 * Q4. Length and volume are the diagnostic fields; model/brand is optional and
 * not processed in V1. The photo upload the question allows for is left out —
 * V1 does not process it, so it would be a control that does nothing.
 *
 * Each field offers both ways of knowing a dimension, because the two users
 * here are genuinely different: someone reading off their own board knows
 * "32.4 L", and someone estimating knows "about 31 to 34". A single control
 * would have forced one of them to lie.
 *
 * The exact/approximate distinction is preserved in the data rather than
 * flattened at entry: a typed volume also sets `volumeExact`, a picked bucket
 * leaves it null. `volume` stays a display string either way, which is what
 * the Translation Layer reads.
 */

const LENGTH_FEET = [4, 5, 6, 7, 8, 9, 10]
const INCHES = Array.from({ length: 12 }, (_, i) => i)

/** Same typographic primes the predefined options use, so the two agree. */
const formatLength = (ft: number, inch: number) => `${ft}’${inch}″`

export function DimensionsFields({
  value,
  onChange,
}: {
  value: DimensionsAnswer
  onChange: (v: DimensionsAnswer) => void
}) {
  // Opens on whichever mode the existing answer came from, so Back is lossless
  // in appearance as well as in data.
  const [lengthMode, setLengthMode] = useState<'pick' | 'type'>(() =>
    value.length && !BOARD_LENGTH_OPTIONS.includes(value.length) ? 'type' : 'pick',
  )
  const [volumeMode, setVolumeMode] = useState<'range' | 'exact'>(value.volumeExact !== null ? 'exact' : 'range')

  const typed = parseTyped(value.length)

  const setTypedLength = (ft: number | null, inch: number | null) => {
    if (ft === null) return onChange({ ...value, length: null })
    onChange({ ...value, length: formatLength(ft, inch ?? 0) })
  }

  return (
    <div className="fields">
      <div className="field">
        <div className="field__head">
          <label className="field__label" htmlFor={lengthMode === 'pick' ? 'dim-length' : 'dim-length-ft'}>
            Length
          </label>
          <ModeToggle
            label="How to enter length"
            value={lengthMode}
            onChange={(m) => setLengthMode(m)}
            options={[
              { value: 'pick', label: 'Pick' },
              { value: 'type', label: 'Type' },
            ]}
          />
        </div>

        {lengthMode === 'pick' ? (
          <div className="select">
            <select
              id="dim-length"
              className="field__control mono"
              value={value.length && BOARD_LENGTH_OPTIONS.includes(value.length) ? value.length : ''}
              onChange={(e) => onChange({ ...value, length: e.target.value || null })}
            >
              <option value="">Select</option>
              {BOARD_LENGTH_OPTIONS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="field__row field__row--split">
            <div className="select select--narrow">
              <select
                id="dim-length-ft"
                className="field__control mono"
                aria-label="Length, feet"
                value={typed.ft ?? ''}
                onChange={(e) => setTypedLength(e.target.value === '' ? null : Number(e.target.value), typed.inch)}
              >
                <option value="">—</option>
                {LENGTH_FEET.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>
            <span className="field__unit mono">ft</span>
            <div className="select select--narrow">
              <select
                className="field__control mono"
                aria-label="Length, inches"
                value={typed.inch ?? 0}
                onChange={(e) => setTypedLength(typed.ft, Number(e.target.value))}
              >
                {INCHES.map((i) => (
                  <option key={i} value={i}>
                    {i}
                  </option>
                ))}
              </select>
            </div>
            <span className="field__unit mono">in</span>
          </div>
        )}
      </div>

      <div className="field">
        <div className="field__head">
          <label className="field__label" htmlFor={volumeMode === 'range' ? 'dim-volume' : 'dim-volume-exact'}>
            Volume
          </label>
          <ModeToggle
            label="How to enter volume"
            value={volumeMode}
            onChange={(m) => {
              setVolumeMode(m)
              // Switching mode clears the other mode's value rather than
              // carrying a bucket across as if it had been measured.
              onChange({ ...value, volume: null, volumeExact: null })
            }}
            options={[
              { value: 'range', label: 'About' },
              { value: 'exact', label: 'Exact' },
            ]}
          />
        </div>

        {volumeMode === 'range' ? (
          <div className="select">
            <select
              id="dim-volume"
              className="field__control mono"
              value={value.volumeExact === null && value.volume ? value.volume : ''}
              onChange={(e) =>
                onChange({ ...value, volume: e.target.value || null, volumeExact: null })
              }
            >
              <option value="">Select</option>
              {BOARD_VOLUME_OPTIONS.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="field__row">
            <input
              id="dim-volume-exact"
              className="field__control mono"
              type="number"
              inputMode="decimal"
              step="0.1"
              min="10"
              max="120"
              autoComplete="off"
              placeholder="32.4"
              value={value.volumeExact ?? ''}
              onChange={(e) => {
                const n = e.target.value.trim() === '' ? null : Number(e.target.value)
                onChange({
                  ...value,
                  volumeExact: n,
                  // One decimal, matching how shapers print it on the stringer.
                  volume: n === null || Number.isNaN(n) ? null : `${Number(n.toFixed(1))} L`,
                })
              }}
            />
            <span className="field__unit mono">L</span>
          </div>
        )}
      </div>

      <div className="field field--wide">
        <label className="field__label" htmlFor="dim-model">
          Model or brand <span className="field__optional">optional</span>
        </label>
        <input
          id="dim-model"
          className="field__control"
          type="text"
          autoComplete="off"
          placeholder="If you know it"
          value={value.modelBrand}
          onChange={(e) => onChange({ ...value, modelBrand: e.target.value })}
        />
      </div>
    </div>
  )
}

/** `6’2″` → { ft: 6, inch: 2 }. Accepts both prime styles. */
function parseTyped(display: string | null): { ft: number | null; inch: number | null } {
  if (!display) return { ft: null, inch: null }
  const m = display.match(/(\d+)\s*[’'`]\s*(\d+)?/)
  if (!m) return { ft: null, inch: null }
  return { ft: Number(m[1]), inch: m[2] === undefined ? 0 : Number(m[2]) }
}
