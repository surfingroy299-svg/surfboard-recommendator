import { BOARD_LENGTH_OPTIONS, BOARD_VOLUME_OPTIONS } from '../../logic/questions'
import type { DimensionsAnswer } from '../../logic/answers'

/**
 * Q4. Length and volume are the diagnostic fields; model/brand is optional and
 * not processed in V1. The photo upload the question allows for is left out —
 * V1 does not process it, so it would be a control that does nothing.
 */
export function DimensionsFields({
  value,
  onChange,
}: {
  value: DimensionsAnswer
  onChange: (v: DimensionsAnswer) => void
}) {
  return (
    <div className="fields">
      <div className="field">
        <label className="field__label" htmlFor="dim-length">
          Length
        </label>
        <select
          id="dim-length"
          className="field__control mono"
          value={value.length ?? ''}
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

      <div className="field">
        <label className="field__label" htmlFor="dim-volume">
          Volume
        </label>
        <select
          id="dim-volume"
          className="field__control mono"
          value={value.volume ?? ''}
          onChange={(e) => onChange({ ...value, volume: e.target.value || null })}
        >
          <option value="">Select</option>
          {BOARD_VOLUME_OPTIONS.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
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
