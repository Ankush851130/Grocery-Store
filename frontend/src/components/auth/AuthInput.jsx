import { forwardRef } from 'react';

const AuthInput = forwardRef(function AuthInput(
  { label, error, helperText, leftIcon: LeftIcon, className = '', ...inputProps },
  ref,
) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{label}</span>
      <div className="relative">
        {LeftIcon ? (
          <LeftIcon className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
        ) : null}
        <input
          ref={ref}
          className={`w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-3 text-slate-900 dark:text-white outline-none transition placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/40 ${LeftIcon ? 'pl-11 pr-4' : 'px-4'} ${className}`}
          {...inputProps}
        />
      </div>
      {helperText ? <p className="text-xs text-slate-500 dark:text-slate-400">{helperText}</p> : null}
      {error ? <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p> : null}
    </label>
  );
});

AuthInput.displayName = 'AuthInput';

export default AuthInput;
