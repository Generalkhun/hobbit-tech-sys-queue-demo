export type DetailItem = readonly [label: string, value: string];

export interface ContactPhonesValidation {
  phones: string[];
  error: string;
}
