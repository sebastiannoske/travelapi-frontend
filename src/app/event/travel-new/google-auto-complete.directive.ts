import { Directive, ElementRef, OnInit, Output, EventEmitter } from '@angular/core';
import { MapsAPILoader } from '@agm/core';

declare var google: any;

@Directive({
  selector: '[appGoogleAutoComplete]'
})
export class GoogleAutoCompleteDirective implements OnInit {
  @Output() notifyForAddressData: EventEmitter<any> = new EventEmitter<any>();
  autocomplete: any;
  componentForm: any;

  constructor(private _elementRef: ElementRef, private _loader: MapsAPILoader) { }

  ngOnInit() {
    this.initAutocomplete();
  }

  private initAutocomplete() {

        this._loader.load().then(() => {
            // Create the autocomplete object, restricting the search to geographical
            // location types.
            this.autocomplete = new google.maps.places.Autocomplete(
                /** @type {!HTMLInputElement} */(this._elementRef.nativeElement),
                {types: ['geocode']});

            this.componentForm = {
                locality: 'long_name',
                route: 'long_name',
                postal_code: 'short_name',
                street_number: 'short_name',
                country: 'long_name'
            };

            // When the user selects an address from the dropdown, populate the address
            // fields in the form.
            this.autocomplete.addListener('place_changed', () => this.fillInAddress(this));

        });
    }

    public fillInAddress( scope ) {
        // Get the place details from the autocomplete object.
        const place = scope.autocomplete.getPlace();
        const addressFields = {
          city: '',
          street: '',
          streetNumber: '',
          postcode: '',
          country: '',
          countryShort: ''
        };

        // console.log(place);

        // Get each part of the address from the place details
        // and fill the corresponding field on the form.

        if (place.address_components) {
            for (let i = 0; i < place.address_components.length; i++) {
                const addressType = place.address_components[i].types[0];

                if (this.componentForm[addressType]) {
                    const val = place.address_components[i][this.componentForm[addressType]];

                    switch (addressType) {

                        case 'locality':
                            addressFields.city = val;
                            break;
                        case 'route':
                            addressFields.street = val;
                            break;
                        case 'street_number':
                            addressFields.streetNumber = val;
                            break;
                        case 'postal_code':
                            addressFields.postcode = val;
                            break;
                        case 'country':
                            addressFields.country = val;
                            addressFields.countryShort = place.address_components[i]['short_name'];
                            break;
                        default:
                            break;

                    }
                }
            }
        }

        if (place.geometry) {
            this.notifyForAddressData.emit({
            addressFields: addressFields,
            lng: place.geometry.location.lng(),
            lat: place.geometry.location.lat(),
            viewport: place.geometry.viewport
            });
        }
    }

}
