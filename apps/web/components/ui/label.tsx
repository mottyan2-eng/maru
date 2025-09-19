import { clsx } from 'clsx';
import { forwardRef } from 'react';

const Label = forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={clsx('text-sm font-medium text-slate-700', className)}
      {...props}
    />
  )
);

Label.displayName = 'Label';

export { Label };
