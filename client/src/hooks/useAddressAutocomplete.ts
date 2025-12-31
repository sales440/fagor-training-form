import { useEffect, useRef } from 'react';

interface AddressComponents {
  address1: string;
  city: string;
  state: string;
  zipCode: string;
}

interface UseAddressAutocompleteProps {
  onPlaceSelected: (address: AddressComponents) => void;
}

export function useAddressAutocomplete({ onPlaceSelected }: UseAddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    if (!inputRef.current) return;

    // Wait for Google Maps API to load
    const initAutocomplete = () => {
      if (!window.google || !window.google.maps || !window.google.maps.places) {
        setTimeout(initAutocomplete, 100);
        return;
      }

      // Initialize autocomplete
      autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current!, {
        types: ['address'],
        componentRestrictions: { country: 'us' }, // Restrict to US addresses only
        fields: ['address_components', 'formatted_address'],
      });

      // Listen for place selection
      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current?.getPlace();
        if (!place || !place.address_components) return;

        // Parse address components
        const components: AddressComponents = {
          address1: '',
          city: '',
          state: '',
          zipCode: '',
        };

        let streetNumber = '';
        let route = '';

        place.address_components.forEach((component) => {
          const type = component.types[0];

          switch (type) {
            case 'street_number':
              streetNumber = component.long_name;
              break;
            case 'route':
              route = component.long_name;
              break;
            case 'locality':
              components.city = component.long_name;
              break;
            case 'administrative_area_level_1':
              components.state = component.short_name; // Use short_name for state abbreviation (e.g., "TX")
              break;
            case 'postal_code':
              components.zipCode = component.long_name;
              break;
          }
        });

        // Combine street number and route for address1
        components.address1 = `${streetNumber} ${route}`.trim();

        onPlaceSelected(components);
      });
    };

    initAutocomplete();

    return () => {
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [onPlaceSelected]);

  return inputRef;
}
