import { forwardRef } from 'react';

const AuthInput = forwardRef(function AuthInput(
  { label, error, helperText, leftIcon: LeftIcon, className = '', ...inputProps },
  ref,
) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <div className="relative">
        {LeftIcon ? (
          <LeftIcon className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        ) : null}
        <input
          ref={ref}
          className={`w-full rounded-2xl border border-slate-200 bg-white py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100 ${LeftIcon ? 'pl-11 pr-4' : 'px-4'} ${className}`}
          {...inputProps}
        />
      </div>
      {helperText ? <p className="text-xs text-slate-500">{helperText}</p> : null}
      {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
    </label>
  );
});

AuthInput.displayName = 'AuthInput';

export default AuthInput;
