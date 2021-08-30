import React from "react";
import { CountriesFilterBlock } from "./filter-components/CountriesFilterBlock";
import { DevicesFilterBlock } from "./filter-components/DevicesFilterBlock";
import { StepFilterBlock } from "./filter-components/StepFilterBlock";
import { PeopleFilterBlock } from "./filter-components/PeopleFilterBlock";
import { DateFilterBlock } from "./filter-components/DateFilterBlock";

export const FILTER_BLOCK_TYPES = {
  DATE: 'DATE',
  PEOPLE: 'PEOPLE',
  STEP: 'STEP',
  DEVICE: 'DEVICE',
  COUNTRIES: 'COUNTRIES',
};

export const FiltersBlock = ({
  type,
  filtersSet,
  currentFilters,
  setFilters,
  funnel,
  sessions,
  sendToStore,
  onUpdateStepFocused,
  selectedStep,
  onClearStep,
  scrollTopPosition,
}) => {
  return (
    <>
      {filtersSet.includes(FILTER_BLOCK_TYPES.DATE) && (
        <DateFilterBlock
          type={type}
          inputStart={currentFilters.inputStart}
          inputFinish={currentFilters.inputFinish}
          onSelectDate={setFilters}
          sendToStore={sendToStore}
          scrollTopPosition={scrollTopPosition}
        />
      )}
      {filtersSet.includes(FILTER_BLOCK_TYPES.COUNTRIES) && (
        <CountriesFilterBlock
          type={type}
          funnel={funnel}
          selectedCountries={currentFilters.countries}
          onSelectCountries={setFilters}
        />
      )}
      {filtersSet.includes(FILTER_BLOCK_TYPES.DEVICE) && (
        <DevicesFilterBlock
          type={type}
          funnel={funnel}
          selectedDevice={currentFilters.device}
          onSelectDevice={setFilters}
        />
      )}
      {filtersSet.includes(FILTER_BLOCK_TYPES.STEP) && (
        <StepFilterBlock
          type={type}
          funnel={funnel}
          onSelectStep={setFilters}
          onUpdateStepFocused={onUpdateStepFocused}
          selectedStep={selectedStep}
          onClearStep={onClearStep}
        />
      )}
      {filtersSet.includes(FILTER_BLOCK_TYPES.PEOPLE) && (
        <PeopleFilterBlock
          type={type}
          funnel={funnel}
          sessions={sessions}
          selectedSession={currentFilters.session}
          onSelectSession={setFilters}
        />
      )}
    </>
  );
};
