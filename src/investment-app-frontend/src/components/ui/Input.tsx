import React, { InputHTMLAttributes, forwardRef, memo } from 'react';
import clsx from 'clsx';
import FormFieldWrapper from './FormFieldWrapper';

interface IInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const InputComponent = forwardRef<HTMLInputElement, IInputProps>(
  ({ label, error, ...props }, ref) => {
    return (
      <FormFieldWrapper label={label || ''} error={error}>
        <input
          {...props}
          ref={ref}
          className={clsx('form-field', { error: !!error })}
        />
      </FormFieldWrapper>
    );
  }
);

const Input = memo(InputComponent);

export default Input;
