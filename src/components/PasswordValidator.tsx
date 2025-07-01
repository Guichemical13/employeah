import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Check, X, Info } from 'lucide-react';

interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
}

interface PasswordValidatorProps {
  password: string;
  showRequirements?: boolean;
  className?: string;
}

const PASSWORD_REQUIREMENTS: PasswordRequirement[] = [
  {
    label: 'Pelo menos 8 caracteres',
    test: (password) => password.length >= 8,
  },
  {
    label: 'Pelo menos uma letra maiúscula',
    test: (password) => /[A-Z]/.test(password),
  },
  {
    label: 'Pelo menos uma letra minúscula',
    test: (password) => /[a-z]/.test(password),
  },
  {
    label: 'Pelo menos um número',
    test: (password) => /[0-9]/.test(password),
  },
];

export default function PasswordValidator({ 
  password, 
  showRequirements = true,
  className 
}: PasswordValidatorProps) {
  const getPasswordStrength = () => {
    const fulfilledCount = PASSWORD_REQUIREMENTS.filter(req => req.test(password)).length;
    
    if (fulfilledCount === 0) return { level: 0, label: 'Muito fraca', color: 'bg-gray-300' };
    if (fulfilledCount === 1) return { level: 1, label: 'Fraca', color: 'bg-red-500' };
    if (fulfilledCount === 2) return { level: 2, label: 'Regular', color: 'bg-yellow-500' };
    if (fulfilledCount === 3) return { level: 3, label: 'Boa', color: 'bg-blue-500' };
    if (fulfilledCount === 4) return { level: 4, label: 'Muito boa', color: 'bg-green-500' };
    
    return { level: 0, label: 'Muito fraca', color: 'bg-gray-300' };
  };

  const isValidPassword = () => {
    return PASSWORD_REQUIREMENTS.every(req => req.test(password));
  };

  const strength = getPasswordStrength();

  if (!showRequirements && !password) {
    return null;
  }

  return (
    <div className={className}>
      {password && (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Força da senha:</span>
            <span className={`text-sm font-medium ${
              strength.level >= 3 ? 'text-green-600' : 
              strength.level >= 2 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {strength.label}
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${strength.color}`}
              style={{ width: `${(strength.level / 4) * 100}%` }}
            />
          </div>
        </div>
      )}

      {showRequirements && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <div className="mb-2 font-medium">Sua senha deve conter:</div>
            <ul className="space-y-1">
              {PASSWORD_REQUIREMENTS.map((requirement, index) => {
                const isFulfilled = password ? requirement.test(password) : false;
                return (
                  <li 
                    key={index} 
                    className={`flex items-center text-sm ${
                      isFulfilled ? 'text-green-600' : 'text-gray-600'
                    }`}
                  >
                    {isFulfilled ? (
                      <Check className="h-4 w-4 mr-2 text-green-500" />
                    ) : (
                      <X className="h-4 w-4 mr-2 text-gray-400" />
                    )}
                    {requirement.label}
                  </li>
                );
              })}
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

export { PASSWORD_REQUIREMENTS, PasswordValidator };

// Hook para validação de senha
export const usePasswordValidation = (password: string) => {
  const isValid = PASSWORD_REQUIREMENTS.every(req => req.test(password));
  const fulfilledCount = PASSWORD_REQUIREMENTS.filter(req => req.test(password)).length;
  const strength = fulfilledCount / PASSWORD_REQUIREMENTS.length;
  
  return {
    isValid,
    strength,
    fulfilledCount,
    requirements: PASSWORD_REQUIREMENTS.map(req => ({
      ...req,
      fulfilled: req.test(password)
    }))
  };
};
