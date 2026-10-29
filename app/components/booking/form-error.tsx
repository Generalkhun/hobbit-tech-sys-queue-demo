interface FormErrorProps {
  message: string;
  className: string;
}

export function FormError({ message, className }: FormErrorProps) {
  if (!message) return null;
  return (
    <p role="alert" className={className}>
      {message}
    </p>
  );
}
