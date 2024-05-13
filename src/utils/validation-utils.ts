import { BadRequestException } from '@nestjs/common';
import { ValidationError, validate } from 'class-validator';

// Collects error messages returned as an array
function getValidationErrorsAsArray(error: ValidationError): string[] {
  const errorMessages = [];

  const collectErrorMessages = (error: ValidationError) => {
    if (error.constraints) {
      errorMessages.push(...Object.values(error.constraints));
    }
    if (error.children && error.children.length > 0) {
      error.children.forEach(collectErrorMessages);
    }
  };

  collectErrorMessages(error);
  return errorMessages;
}

function getValidationErrors(error: ValidationError): string {
  const errorMessages = [];

  const collectErrorMessages = (error: ValidationError) => {
    if (error.constraints) {
      errorMessages.push(...Object.values(error.constraints));
    }
    if (error.children && error.children.length > 0) {
      error.children.forEach(collectErrorMessages);
    }
  };

  collectErrorMessages(error);
  return errorMessages.join(', ');
}

async function validateDTO(dto: any) {
  const errors = await validate(dto);
  if (errors.length > 0) {
    // Transform the validation errors into a useful format for the client
    const formattedErrors = errors.map((error) => ({
      property: error.property,
      constraints: error.constraints,
    }));
    throw new BadRequestException(formattedErrors);
  }
}

export { getValidationErrorsAsArray, getValidationErrors, validateDTO };
