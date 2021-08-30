import axios from 'axios';
import { RP_EVENT_ERROR_MESSAGE, RP_EVENT_UPDATE_STEP_THUMBNAIL } from '../../shared/CSharedEvents';
import {
  ERROR_MESSAGES,
  FILTER_PROPERTY,
  DEVICE_PROPERTY,
  PROFILES_PROPERTY,
} from '../../shared/CSharedConstants';
import { EElementTypes } from '../../shared/CSharedCategories';
import SharedElementHelpers from 'shared/SharedElementHelpers';
import { commonSendEventFunction } from 'shared/CSharedMethods';
import { getAuthToken } from 'react-project/Util/AuthCookie';
import omit from 'lodash/omit';
import get from 'lodash/get';

import serializer from 'react-project/json-api/serializer';
import { TrackerSessionType } from 'react-project/json-api/types';
import { parseURL } from 'react-project/Helpers/AnalyticsHelpers';
import { ActionTypes } from 'shared/CSharedConstants';
import { COMMERCE_ACTION_NAME, COMMERCE_ACTIONS } from 'react-project/Constants/commerceAction';

const axiosInstance = axios.create();

class RequestService {
  constructor() {
    this.URL = `${process.env.REACT_APP_API_URL}`;
    this.URLAnalytics = `${process.env.REACT_APP_ANALYTICS_API_URL}`;
    this.mockedData = {
      options: {
        peopleVsTotal: 'individual-people',
      },
      filter: {
        range: {
          min: '2020-10-11T04:00:00.000Z',
          max: '2020-10-12T03:59:59.999Z',
        },
        canvas: {
          dictionary: {
            '2ecae701-2841-4a34-b78f-58a49e022baf': {
              id: '2ecae701-2841-4a34-b78f-58a49e022baf',
              category: 'step',
              type: 'page',
              url: 'www.funnelytics.io/',
            },
            '0f82f351-1581-4e97-bad5-0464dcbe511b': {
              id: '0f82f351-1581-4e97-bad5-0464dcbe511b',
              category: 'step',
              type: 'page',
              url: 'app.funnelytics.io/register/',
            },
            'e4e788a8-3ddc-4b6c-a99d-6ec461d01609': {
              id: 'e4e788a8-3ddc-4b6c-a99d-6ec461d01609',
              category: 'step',
              type: 'source',
              attributes: [
                {
                  key: 'utm_source',
                  value: 'facebook',
                  contains: true,
                },
                {
                  key: 'utm_medium',
                  value: 'ad',
                  contains: true,
                },
              ],
            },
          },
          connections: [
            {
              id: '86507b13-03d8-40d9-be7b-bd2c9f0ed3b4',
              source: 'e4e788a8-3ddc-4b6c-a99d-6ec461d01609',
              target: '2ecae701-2841-4a34-b78f-58a49e022baf',
              category: 'connection',
            },
            {
              id: '63d6cea3-d0a8-42f4-9b56-676589fab700',
              source: '2ecae701-2841-4a34-b78f-58a49e022baf',
              target: '0f82f351-1581-4e97-bad5-0464dcbe511b',
              category: 'connection',
            },
          ],
          isDisabled: 'false',
        },
      },
    };

    this.compareMockedData = {
      options: {
        peopleVsTotal: 'individual-people',
      },
      filter: {
        range: {
          min: '',
          max: '',
        },
        canvas: {
          dictionary: {},
          connections: [],
          isDisabled: 'false',
        },
      },
    };

    this.ExplorerMockedData = {
      options: {
        peopleVsTotal: 'individual-people',
      },
      filter: {
        pagination: {
          page: 1,
        },
        range: {
          min: '2020-12-01T05:00:00.000Z',
          max: '2020-12-02T04:59:59.999Z',
        },
        explorer: {
          explored_step_is_dependent_action: 'false',
        },
      },
    };

    axiosInstance.interceptors.request.use(function (config) {
      const token = getAuthToken();
      config.headers.Authorization = `Bearer ${token}`;

      return config;
    });
  }

  dateCalculation = (dateRange) => {
    let transformDate = {
      max: '',
      min: '',
    };
    if (dateRange.max === dateRange.min) {
      transformDate.max = new Date(new Date(dateRange.max).setHours(23, 59, 59, 0)).toISOString();
      transformDate.min = new Date(new Date(dateRange.min).setHours(0, 0, 0, 0)).toISOString();
    } else {
      transformDate.max = new Date(new Date(dateRange.max).setHours(23, 59, 59, 0)).toISOString();
      transformDate.min = dateRange.min;
    }
    return transformDate;
  };

  setFilters = (filters, compareMode = false) => {
    if (filters.device && filters.device !== 'all devices') {
      this.mockedData[FILTER_PROPERTY][DEVICE_PROPERTY] = filters.device;
      this.ExplorerMockedData[FILTER_PROPERTY][DEVICE_PROPERTY] = filters.device;
      if (compareMode) {
        this.compareMockedData[FILTER_PROPERTY][DEVICE_PROPERTY] = filters.device;
      }
    } else {
      delete this.mockedData[FILTER_PROPERTY][DEVICE_PROPERTY];
      delete this.ExplorerMockedData[FILTER_PROPERTY][DEVICE_PROPERTY];
      if (compareMode) {
        delete this.compareMockedData[FILTER_PROPERTY][DEVICE_PROPERTY];
      }
    }

    if (filters.countries && filters.countries[0] !== 'all countries') {
      this.mockedData[FILTER_PROPERTY][PROFILES_PROPERTY] = {
        countries: {
          allow: filters.countries,
        },
      };
      this.ExplorerMockedData[FILTER_PROPERTY][PROFILES_PROPERTY] = {
        countries: {
          allow: filters.countries,
        },
      };
      if (compareMode) {
        this.compareMockedData[FILTER_PROPERTY][PROFILES_PROPERTY] = {
          countries: {
            allow: filters.countries,
          },
        };
      }
    }

    if (filters.session) {
      if (compareMode) {
        this.compareMockedData.filter.session = filters.session;
      } else {
        this.mockedData.filter.session = filters.session;
      }
    } else {
      if (compareMode) {
        delete this.compareMockedData.filter.session;
      } else {
        delete this.mockedData.filter.session;
      }
    }
  };

  dataTransformation = (funnelConfiguration, dataObjs, dataConnections, compareMode = false) => {
    if (compareMode && funnelConfiguration.compareFilter) {
      this.setFilters(funnelConfiguration.compareFilter, compareMode);
    } else if (funnelConfiguration.filter) {
      this.setFilters(funnelConfiguration.filter);
    }

    if (compareMode) {
      const dateRange = this.dateCalculation(funnelConfiguration.compareDateRange);
      this.compareMockedData[FILTER_PROPERTY]['range']['max'] = dateRange.max;
      this.compareMockedData[FILTER_PROPERTY]['range']['min'] = dateRange.min;
    } else {
      const dateRange = this.dateCalculation(funnelConfiguration.dateRange);
      this.mockedData[FILTER_PROPERTY]['range']['max'] = dateRange.max;
      this.mockedData[FILTER_PROPERTY]['range']['min'] = dateRange.min;
    }

    const tempDataObj = {};
    const tempDataConnections = [];
    dataObjs.forEach((item) => {
      const stringId = item.ID + '';
      // We should skip the step elements from the Misc (Offline) type
      if (SharedElementHelpers.IsStep(item) && !SharedElementHelpers.IsMisc(item)) {
        tempDataObj[stringId] = {
          id: stringId,
          category: item.category?.toLowerCase(),
          type: item.type?.toLowerCase(),
          url: item.url ? parseURL(item.url) : '',
          is_commerce: (item.actionType === ActionTypes.COMMERCE).toString(),
          name: item.actionType === ActionTypes.COMMERCE ? COMMERCE_ACTION_NAME : item.label,
        };

        const hasFilterData = item.filterData && item.filterData.length > 0;

        if (hasFilterData) {
          tempDataObj[stringId]['attributes'] = item.filterData.map((el) => ({
            ...el,
            contains: 'true',
          }));
        }

        const hasUtmData = item.utmData && Object.values(item.utmData).some((v) => v !== undefined);

        if (hasUtmData) {
          tempDataObj[stringId]['attributes'] = tempDataObj[stringId]['attributes'] || [];

          const utmAttributes = Object.entries(item.utmData)
            .filter((e) => e[1] !== undefined)
            .map((i) => ({ key: `utm_${i[0]}`, value: i[1], contains: 'true' }));

          tempDataObj[stringId]['attributes'].push(...utmAttributes);
        }
      }
      // Setting properties for dependent action elements
      if (SharedElementHelpers.IsAction(item) && item.isDependentAction) {
        tempDataObj[stringId]['type'] = EElementTypes.DEPENDENT;
        tempDataObj[stringId]['name'] =
          COMMERCE_ACTIONS.indexOf(item.label) !== -1 ? COMMERCE_ACTION_NAME : item.label;
        tempDataObj[stringId]['source'] = item.source;
        tempDataObj[stringId]['target'] = item.target;
        tempDataObj[stringId]['is_commerce'] = (!!item.is_commerce).toString();
      }

      if (compareMode) {
        if (funnelConfiguration.stepCompareFocusingId === stringId) {
          const focusedCopy = { ...tempDataObj[stringId] };
          this.compareMockedData[FILTER_PROPERTY]['focus'] = focusedCopy;
        }
      } else {
        if (funnelConfiguration.stepFocusingId === stringId) {
          const focusedCopy = { ...tempDataObj[stringId] };
          this.mockedData[FILTER_PROPERTY]['focus'] = focusedCopy;
        }
      }
    });

    if (dataConnections && dataConnections.length > 0) {
      const objectKeys = Object.keys(tempDataObj);
      // Do not use in the request joints between elements that are not in the dictionary
      const filteredConnections = dataConnections.filter((conn) => {
        if (objectKeys.includes(conn.iconA_ID) && objectKeys.includes(conn.iconB_ID)) {
          return conn;
        }
      });

      filteredConnections.forEach((item) => {
        const connectionItem = {
          id: item.ID,
          source: item.iconA_ID,
          target: item.iconB_ID,
          category: 'connection',
          ignore_in_between: 'false',
        };
        if (item.ignoreInBetween) {
          connectionItem['ignore_in_between'] = item.ignoreInBetween.toString();
        }
        tempDataConnections.push(connectionItem);
      });
    }
    // todo Do not send the request if we have no elements to request data from
    if (compareMode) {
      this.compareMockedData[FILTER_PROPERTY]['canvas']['dictionary'] = tempDataObj;
      this.compareMockedData[FILTER_PROPERTY]['canvas']['connections'] = tempDataConnections;
    } else {
      this.mockedData[FILTER_PROPERTY]['canvas']['dictionary'] = tempDataObj;
      this.mockedData[FILTER_PROPERTY]['canvas']['connections'] = tempDataConnections;
    }

    return new Promise((resolve) => {
      resolve('data was transformed');
    });
  };

  removeFilterData = (rawData) => {
    const dataWithoutFilters = rawData;
    const objects = [];
    rawData.objects.forEach((item) => {
      if (item.stepFocused) {
        item.stepFocused = false;
      }
      objects.push(item);
    });
    dataWithoutFilters.objects = objects;
    dataWithoutFilters.funnelConfiguration = {};

    return dataWithoutFilters;
  };

  loadAnalyticsRequest = (projectId, compareMode) => {
    const data = compareMode ? this.compareMockedData : this.mockedData;
    return axiosInstance
      .post(`${this.URLAnalytics}/canvas`, data, {
        headers: {
          'X-Project-Id': projectId,
        },
      })
      .then((response) => {
        console.log('Analytic response: ', response.data.canvas_entities);
        delete this.mockedData[FILTER_PROPERTY]['focus'];
        delete this.compareMockedData[FILTER_PROPERTY]['focus'];
        return {
          success: true,
          data: response.data,
        };
      })
      .catch((error) => {
        commonSendEventFunction(RP_EVENT_ERROR_MESSAGE, {
          errorMSG: ERROR_MESSAGES.ANALYTICS_ERROR,
        });
        return {
          success: false,
        };
      });
  };

  fetchFunnelRequest = async (funnelId) => {
    try {
      const response = await axiosInstance.get(`${this.URL}/funnels/${funnelId}`);

      return {
        success: true,
        data: {
          id: response.data.data.id,
          ...response.data.data.attributes,
          projectId: response.data.data.relationships.project.data.id,
        },
      };
    } catch (error) {
      commonSendEventFunction(RP_EVENT_ERROR_MESSAGE, {
        errorMSG: ERROR_MESSAGES.LOAD_FUNNEL_ERROR,
      });
      let errorStatus;
      error.response && error.response.status
        ? (errorStatus = error.response.status)
        : (errorStatus = error.message);
      return {
        success: false,
        errorStatus: errorStatus,
      };
    }
  };

  loadFunnelRequest = (funnelId, params = {}) => {
    return axiosInstance
      .get(`${this.URL}/funnels/load/${funnelId}`, {
        params,
      })
      .then((response) => {
        const urlForLoad = response.data.url;
        return axios.get(`${urlForLoad}`);
      })
      .catch((error) => {
        if (error.response.status !== 404) {
          commonSendEventFunction(RP_EVENT_ERROR_MESSAGE, {
            errorMSG: ERROR_MESSAGES.LOAD_FUNNEL_ERROR,
          });
        }
      });
  };

  loadFunnelRevisionsRequest = async (funnelId, offset, limit) => {
    return axiosInstance
      .get(`${this.URL}/funnel-revisions/funnel/${funnelId}`, {
        method: 'GET',
        params: {
          offset,
          limit,
        },
      })
      .then((response) => {
        return {
          success: true,
          data: response.data,
        };
      })
      .catch((error) => {
        return {
          success: false,
        };
      });
  };

  saveFunnelRequest = async (funnelId, objForSendingRaw, previewBase64) => {
    const objForSending = this.removeFilterData(objForSendingRaw);
    const previewForSending = await fetch(previewBase64);

    try {
      const revisionIdResponse = await axiosInstance.get(`${this.URL}/funnel-revisions/id`);

      console.log('response on GET request: ', revisionIdResponse.data);

      const revisionId = revisionIdResponse.data.id;
      const uploadResponse = await axiosInstance.post(
        `${this.URL}/funnel-revisions/upload/`,
        {
          funnel: funnelId,
          revision: revisionId,
          previewContentType: 'image/png',
        }
      );
      const funnelUrl = uploadResponse.data.funnel.url;
      await axios.put(
        `${funnelUrl}`,
        {
          ...objForSending,
        },
        {
          headers: {
            'Content-Type': 'binary/octet-stream',
          },
        }
      );

      const previewUrl = uploadResponse.data.preview.url;
      const blob = await previewForSending.blob();

      await axios.put(`${previewUrl}`, blob, {
        headers: {
          'Content-Type': 'image/png',
        },
      });

      const revisionResponse = await axiosInstance.post(
        `${this.URL}/funnel-revisions`,
        {
          data: {
            id: revisionId,
            attributes: {
              created_at: null,
            },
            relationships: {
              funnel: {
                data: {
                  type: 'funnels',
                  id: funnelId,
                },
              },
            },
            type: 'funnel-revisions',
          },
        }
      );

      console.log('final response on POST request: ', revisionResponse.data);

      return {
        success: true,
      };
    } catch (e) {
      commonSendEventFunction(RP_EVENT_ERROR_MESSAGE, { errorMSG: ERROR_MESSAGES.SAVING_FUNNEL });

      return {
        success: false,
      };
    }
  };

  getSessionsRequest = (projectId, isCompare, last) => {
    const filterData = isCompare ? this.compareMockedData.filter : this.mockedData.filter;
    const payload = {
      filter: {
        ...omit(filterData, 'session'),
      },
    };

    if (last) {
      payload.last = last;
    }

    return axiosInstance
      .post(`${this.URLAnalytics}/sessions`, payload, {
        headers: {
          'X-Project-Id': projectId,
        },
      })
      .then(async (response) => {
        const sessions = await serializer.deserializeAsync(TrackerSessionType, response.data);

        return {
          data: {
            meta: {
              count: response.data.meta.count,
            },
            sessions: sessions.map((session) => {
              const countryNameAttr = session.profile.attrs.find((a) => a.key === 'country_name');
              const countryCodeAttr = session.profile.attrs.find((a) => a.key === 'country_code');

              return {
                id: session.id,
                intId: session.int_id,
                createdAt: new Date(session.created_at),
                userId: session.profile.id,
                country: {
                  name: countryNameAttr && countryNameAttr.value,
                  code: countryCodeAttr && countryCodeAttr.value,
                },
              };
            }),
          },
          success: true,
        };
      })
      .catch((error) => {
        commonSendEventFunction(RP_EVENT_ERROR_MESSAGE, {
          errorMSG: ERROR_MESSAGES.SESSION_PEOPLE_DATA_ERROR,
        });
        return {
          success: false,
        };
      });
  };

  getCountriesRequest = (projectId, compareMode) => {
    const data = compareMode ? this.compareMockedData : this.mockedData;
    return axiosInstance
      .post(
        `${this.URLAnalytics}/profile-attributes`,
        omit(data, 'filter.profiles.countries', 'filter.session'),
        {
          headers: {
            'X-Project-Id': projectId,
          },
        }
      )
      .then((response) => {
        console.log('Countries response: ', response.data.profile_countries);
        // delete  this.mockedData['filter']['focus'];
        return response.data.profile_countries.map((c) => ({
          name: c.name,
          hits: Number(c.hits),
        }));
      })
      .catch((error) => {
        commonSendEventFunction(RP_EVENT_ERROR_MESSAGE, {
          errorMSG: ERROR_MESSAGES.TOP_COUNTRIES_ERROR,
        });
        return [];
      });
  };

  getThumbnailImg = (id, url) => {
    const parsedURL = parseURL(url);

    if (!parsedURL) {
      commonSendEventFunction(RP_EVENT_ERROR_MESSAGE, { errorMSG: ERROR_MESSAGES.THUMBNAIL_ERROR });
      return false;
    }

    return axiosInstance
      .post(
        `${this.URL}/funnels/thumbnail/`,
        {
          /**
           * FIXME
           * https is prefered over http as google is starting to force the protocol
           * We need to reconsider prepending a http protocol to the url.                 *
           */
          url: `http://${parsedURL}`,
        }
      )
      .then((response) => {
        const imgUrl = `https://s3-us-west-2.amazonaws.com/funnelytics-thumbnails/${response.data.path}`;
        const event = new CustomEvent(RP_EVENT_UPDATE_STEP_THUMBNAIL, {
          detail: { id: id, url: imgUrl },
        });
        document.dispatchEvent(event);
        console.log('New thumbnail img path: ', imgUrl);
      })
      .catch((error) => {
        commonSendEventFunction(RP_EVENT_ERROR_MESSAGE, {
          errorMSG: ERROR_MESSAGES.THUMBNAIL_ERROR,
        });
      });
  };

  getExplorerWithoutFiltersRequest = (projectId, pageNumber, funnelConfiguration) => {
    const dateRange = this.dateCalculation(funnelConfiguration.dateRange);
    this.ExplorerMockedData[FILTER_PROPERTY]['range']['max'] = dateRange.max;
    this.ExplorerMockedData[FILTER_PROPERTY]['range']['min'] = dateRange.min;
    if (funnelConfiguration.filter) {
      this.setFilters(funnelConfiguration.filter);
    }

    this.ExplorerMockedData[FILTER_PROPERTY]['pagination']['page'] = pageNumber;
    return axiosInstance
      .post(
        `${this.URLAnalytics}/traffic-explorer/`,
        omit(this.ExplorerMockedData, 'filter.canvas', 'filter.explored_step'),
        {
          headers: {
            'X-Project-Id': projectId,
          },
        }
      )
      .then((response) => {
        console.log('Explorer Analytic response: ', response.data);
        const responseData = {
          next_actions: response.data.next_actions,
          next_actions_all: response.data.next_actions_all,
          has_more_actions: response.data.next_actions.has_more,
          next_pages: response.data.next_pages,
          next_pages_all: response.data.next_pages_all,
          has_more_pages: response.data.next_pages.has_more,
          page_parameters: response.data.page_parameters,
          page_parameters_all: response.data.page_parameters_all,
          previous_pages_all: response.data.previous_pages_all,
          previous_pages: response.data.previous_pages,
          previous_actions_all: response.data.previous_actions_all,
        };
        return new Promise((resolve, reject) => {
          resolve(responseData);
        });
      })
      .catch((error) => {
        commonSendEventFunction(RP_EVENT_ERROR_MESSAGE, {
          errorMSG: ERROR_MESSAGES.TRAFFIC_EXPLORER_ERROR,
        });
      });
  };

  getAttributeExplorerData = (projectId, startData, funnelConfiguration) => {
    const dateRange = this.dateCalculation(funnelConfiguration.dateRange);
    this.ExplorerMockedData[FILTER_PROPERTY]['range']['max'] = dateRange.max;
    this.ExplorerMockedData[FILTER_PROPERTY]['range']['min'] = dateRange.min;

    if (funnelConfiguration.filter) {
      this.setFilters(funnelConfiguration.filter);
    }

    if (startData.type === 'PAGE') {
      this.ExplorerMockedData[FILTER_PROPERTY]['explored_step'] = {
        id: startData.id,
        category: startData.category?.toLowerCase(),
        type: startData.type?.toLowerCase(),
        url: parseURL(startData.url),
      };
      this.ExplorerMockedData[FILTER_PROPERTY]['canvas'] = {
        dictionary: {
          [startData.id]: {
            id: startData.id,
            category: startData.category?.toLowerCase(),
            type: startData.type?.toLowerCase(),
            url: parseURL(startData.url),
          },
        },
      };
    } else {
      // TODO: delete comments
      this.ExplorerMockedData[FILTER_PROPERTY]['explored_step'] = {
        id: startData.id,
        category: startData.category?.toLowerCase(),
        type: startData.type?.toLowerCase(),
        name: startData.isCommerce ? COMMERCE_ACTION_NAME : startData.name,
        is_commerce: (!!startData.isCommerce).toString(),
        attributes: startData.attributes.map((el) => ({ ...el, contains: 'true' })),
      };
      this.ExplorerMockedData[FILTER_PROPERTY]['canvas'] = {
        dictionary: {
          [startData.id]: {
            id: startData.id,
            category: startData.category?.toLowerCase(),
            type: startData.type?.toLowerCase(),
            name: startData.isCommerce ? COMMERCE_ACTION_NAME : startData.name,
            is_commerce: (!!startData.isCommerce).toString(),
            attributes: startData.attributes.map((el) => ({ ...el, contains: 'true' })),
          },
        },
        isDisabled: 'false',
      };
    }

    return axiosInstance
      .post(`${this.URLAnalytics}/traffic-explorer/`, this.ExplorerMockedData, {
        headers: {
          'X-Project-Id': projectId,
        },
      })
      .then((response) => {
        console.log('AttributeExplorer Analytic response: ', response.data);
        if (startData.type === 'PAGE') {
          const responseData = {
            common_parameters: response.data.page_parameters_all.common_parameters,
            custom_parameters: response.data.page_parameters_all.custom_parameters,
            countValue: response.data.page_parameters_all.hits,
          };
          return new Promise((resolve, reject) => {
            resolve(responseData);
          });
        } else {
          const responseData = {
            action_attributes: response.data.action_attributes.key_values,
            countValue: response.data.action_attributes.hits,
          };
          return new Promise((resolve, reject) => {
            resolve(responseData);
          });
        }
      })
      .catch((error) => {
        commonSendEventFunction(RP_EVENT_ERROR_MESSAGE, {
          errorMSG: ERROR_MESSAGES.TRAFFIC_EXPLORER_ERROR,
        });
      });
  };

  getExplorerPageParameters = (projectId, funnelConfiguration, limit) => {
    const dateRange = this.dateCalculation(funnelConfiguration.dateRange);
    this.ExplorerMockedData[FILTER_PROPERTY]['range']['max'] = dateRange.max;
    this.ExplorerMockedData[FILTER_PROPERTY]['range']['min'] = dateRange.min;
    this.ExplorerMockedData[FILTER_PROPERTY]['pagination']['limit'] = limit;

    if (funnelConfiguration.filter) {
      this.setFilters(funnelConfiguration.filter);
    }

    return axiosInstance
      .post(`${this.URLAnalytics}/traffic-explorer/page_parameters`, this.ExplorerMockedData, {
        headers: {
          'X-Project-Id': projectId,
        },
      })
      .then((response) => {
        return response.data;
      })
      .catch((error) => {
        commonSendEventFunction(RP_EVENT_ERROR_MESSAGE, {
          errorMSG: ERROR_MESSAGES.TRAFFIC_EXPLORER_ERROR,
        });
      });
  };

  getExplorerNextPrevSteps = (
    projectId,
    port,
    currentStep,
    funnelConfiguration,
    pageNumber = 1
  ) => {
    const dateRange = this.dateCalculation(funnelConfiguration.dateRange);
    this.ExplorerMockedData[FILTER_PROPERTY]['range']['max'] = dateRange.max;
    this.ExplorerMockedData[FILTER_PROPERTY]['range']['min'] = dateRange.min;
    this.ExplorerMockedData[FILTER_PROPERTY]['pagination']['page'] = pageNumber;
    if (funnelConfiguration.filter) {
      this.setFilters(funnelConfiguration.filter);
    }

    this.ExplorerMockedData[FILTER_PROPERTY]['explored_step'] = {
      id: currentStep.stepId,
      category: currentStep.object.category?.toLowerCase(),
      type: currentStep.object.type?.toLowerCase(),
      url: currentStep.object.url ? parseURL(currentStep.object.url) : '',
      name:
        currentStep.object.actionType === ActionTypes.COMMERCE
          ? COMMERCE_ACTION_NAME
          : currentStep.object.label,
      is_commerce: currentStep.object.actionType === ActionTypes.COMMERCE,
      attributes: currentStep.object.filterData || [],
    };

    this.ExplorerMockedData[FILTER_PROPERTY]['canvas'] = {
      dictionary: {
        [currentStep.stepId]: {
          id: currentStep.stepId,
          category: currentStep.object.category?.toLowerCase(),
          type: currentStep.object.type?.toLowerCase(),
          url: currentStep.object.url ? parseURL(currentStep.object.url) : '',
          name:
            currentStep.object.actionType === ActionTypes.COMMERCE
              ? COMMERCE_ACTION_NAME
              : currentStep.object.label,
          is_commerce: currentStep.object.actionType === ActionTypes.COMMERCE,
          attributes: currentStep.object.filterData || [],
        },
      },
      isDisabled: 'false',
    };

    const hasUtmData =
      currentStep.object.utmData &&
      Object.values(currentStep.object.utmData).some((v) => v !== undefined);

    if (hasUtmData && SharedElementHelpers.IsSource(currentStep)) {
      const utmAttributes = Object.entries(currentStep.object.utmData)
        .filter((e) => e[1] !== undefined)
        .map((i) => ({ key: `utm_${i[0]}`, value: i[1], contains: 'true' }));

      this.ExplorerMockedData[FILTER_PROPERTY]['canvas']['dictionary'][currentStep.stepId][
        'attributes'
      ] = [...currentStep.object.filterData, ...utmAttributes];

      this.ExplorerMockedData[FILTER_PROPERTY]['explored_step']['attributes'] = [
        ...currentStep.object.filterData,
        ...utmAttributes,
      ];
    }

    return axiosInstance
      .post(`${this.URLAnalytics}/traffic-explorer/`, this.ExplorerMockedData, {
        headers: {
          'X-Project-Id': projectId,
        },
      })
      .then((response) => {
        console.log('Explorer Analytic response: ', response.data);
        const responseData = {
          next_actions: response.data.next_actions,
          next_actions_all: response.data.next_actions_all,
          has_more_actions: response.data.next_actions.has_more,
          next_pages: response.data.next_pages,
          next_pages_all: response.data.next_pages_all,
          has_more_pages: response.data.next_pages.has_more,
          page_parameters: response.data.page_parameters,
          page_parameters_all: response.data.page_parameters_all,
          previous_pages_all: response.data.previous_pages_all,
          previous_pages: response.data.previous_pages,
          previous_actions_all: response.data.previous_actions_all,
        };
        return new Promise((resolve, reject) => {
          resolve(responseData);
        });
      })
      .catch((error) => {
        commonSendEventFunction(RP_EVENT_ERROR_MESSAGE, {
          errorMSG: ERROR_MESSAGES.TRAFFIC_EXPLORER_ERROR,
        });
      });
  };

  getProjectApiKey = (projectId) => {
    return axiosInstance
      .get(`${this.URL}/projects/${projectId}/api-key`)
      .then((response) => get(response, ['data', 'api_key'], null))
      .catch(() => null);
  };

  checkActionsExist = (projectId) => {
    return axiosInstance
      .get(`${this.URLAnalytics}/check/exists/actions`, {
        headers: {
          'X-Project-Id': projectId,
        },
      })
      .then((response) => get(response, ['data', 'exists']))
      .catch(() => false);
  };

  hasUserPermission = ({ scopeId, permission, scope, projectId }) => {
    return axiosInstance
      .get(`${this.URL}/user-permissions/has-permission`, {
        headers: {
          'X-Project-Id': projectId,
        },
        params: {
          permission,
          scope,
          scopeId,
          level: 'read',
        },
      })
      .then((response) => response.data)
      .catch(() => false);
  };

  getUserData = ({ userId }) => {
    return axiosInstance
      .get(`${this.URL}/users/${userId}`)
      .then((response) => {
        return response.data;
      })
      .catch(() => false);
  };

  getHubspotToken = () => {
    return axiosInstance
      .post(`${this.URL}/hubspot/token`, null)
      .then((response) => {
        return response.data;
      })
      .catch(() => false);
  };
}
export default RequestService;
