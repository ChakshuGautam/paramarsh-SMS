import {
  type InputProps,
  useInput,
  useResourceContext,
  FieldTitle,
} from "ra-core";
import {
  FormControl,
  FormError,
  FormField,
  FormLabel,
} from "@/components/admin/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { InputHelperText } from "./input-helper-text";
<<<<<<< HEAD
import { cn } from "@/lib/utils";
=======
>>>>>>> origin/main

export type TextInputProps = InputProps & {
  multiline?: boolean;
} & React.ComponentProps<"textarea"> &
  React.ComponentProps<"input">;

export const TextInput = (props: TextInputProps) => {
  const resource = useResourceContext(props);
  const {
    label,
    source,
    multiline,
    className,
    validate: _validateProp,
    format: _formatProp,
    alwaysOn, // Extract alwaysOn to prevent it from being passed to DOM
    ...rest
  } = props;
  const { id, field, isRequired } = useInput(props);

  return (
    <FormField id={id} className={className} name={field.name}>
      {label !== false && (
        <FormLabel>
          <FieldTitle
            label={label}
            source={source}
            resource={resource}
            isRequired={isRequired}
          />
        </FormLabel>
      )}
      <FormControl>
        {multiline ? (
          <Textarea {...rest} {...field} />
        ) : (
<<<<<<< HEAD
          <Input 
            {...rest} 
            {...field} 
            className={cn("h-10 text-sm", rest.className)}
          />
=======
          <Input {...rest} {...field} />
>>>>>>> origin/main
        )}
      </FormControl>
      <InputHelperText helperText={props.helperText} />
      <FormError />
    </FormField>
  );
};
