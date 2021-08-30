import { COMMERCE_ACTION_NAME } from "react-project/Constants/commerceAction";

export const DEFAULT_TEXT_VALUE = 'Start typing';
export const EXPORTED_IMAGE_NAME = 'My Funnel';
export const ANALYTICS_DATA_DEFAULT_PLACEHOLDER = '-';

export const HEADER_HEIGHT = 53;
export const FILTER_ITEM_PADDING_WIDTH = 15;
export const LEFT_SIDEBAR_WIDTH = 320;

export const SAVE_TYPE_AUTO = 'auto';
export const SAVE_TYPE_MANUAL = 'manual';

export const FILTER_TYPE_COMPARE = 'compare';
export const FILTER_TYPE_DEFAULT = 'default';

export const FILTER_TYPE_DEFAULT_STEP = 'default-step';
export const FILTER_TYPE_COMPARE_STEP = 'compare-step';

export const ANALYTICS_STATUS_SUCCESS = 'success';
export const ANALYTICS_STATUS_ERROR = 'error';
export const ANALYTICS_STATUS_LOADING = 'loading';
export const ANALYTICS_STATUS_STALE = 'stale';

export const THUMBNAIL_TYPE = 'thumbnail';

export const FILTER_PROPERTY = 'filter';
export const DEVICE_PROPERTY = 'device';
export const PROFILES_PROPERTY = 'profiles';

export const ACTIVE_STATE_DEFAULT = 'default';
export const ACTIVE_STATE_SELECT = 'select';
export const ACTIVE_STATE_PAN = 'pan';
export const ACTIVE_STATE_DRAW = 'draw';
export const ACTIVE_STATE_TEXT = 'TEXT';
export const ACTIVE_STATE_PWP = 'People Who Performed';

export const EShapeTypes = {
    'CIRCLE': 'CIRCLE',
    'ELLIPSE': 'ELLIPSE',
    'TRIANGLE': 'TRIANGLE',
    'RECTANGLE': 'RECTANGLE',
    'SQUARE': 'SQUARE',
};

export const ActionTypes = {
    'NONE': 'none',
    'COMMERCE': 'commerce'
};

export const PropertyType = {
    'LABEL': 'label',
    'URL': 'url'
};

export const ERROR_MESSAGES = {
    LOAD_FUNNEL_ERROR: 'Unable to load funnel, please refresh your browser and try again',
    ANALYTICS_ERROR: 'Unable to load your data, please try again',
    TRAFFIC_EXPLORER_ERROR: 'Unable to load data, please refresh analytics',
    TOP_COUNTRIES_ERROR: 'Unable to load your data, please refresh analytics',
    SESSION_PEOPLE_DATA_ERROR: 'Unable to load your data, please refresh analytics',
    THUMBNAIL_ERROR: 'Unable to load your thumbnails, check later',
    SAVING_FUNNEL: 'Saving the funnel error'
};

export const CountriesListArr = [
    { name: 'Afghanistan', iso2: 'AF', iso3: 'AFG', isoNumeric: '4' },
    { name: 'Åland Islands', iso2: 'AX', iso3: 'ALA', isoNumeric: '248' },
    { name: 'Albania', iso2: 'AL', iso3: 'ALB', isoNumeric: '8' },
    { name: 'Algeria', iso2: 'DZ', iso3: 'DZA', isoNumeric: '12' },
    { name: 'American Samoa', iso2: 'AS', iso3: 'ASM', isoNumeric: '16' },
    { name: 'Andorra', iso2: 'AD', iso3: 'AND', isoNumeric: '20' },
    { name: 'Angola', iso2: 'AO', iso3: 'AGO', isoNumeric: '24' },
    { name: 'Anguilla', iso2: 'AI', iso3: 'AIA', isoNumeric: '660' },
    { name: 'Antarctica', iso2: 'AQ', iso3: 'ATA', isoNumeric: '10' },
    { name: 'Antigua and Barbuda', iso2: 'AG', iso3: 'ATG', isoNumeric: '28' },
    { name: 'Argentina', iso2: 'AR', iso3: 'ARG', isoNumeric: '32' },
    { name: 'Armenia', iso2: 'AM', iso3: 'ARM', isoNumeric: '51' },
    { name: 'Aruba', iso2: 'AW', iso3: 'ABW', isoNumeric: '533' },
    { name: 'Australia', iso2: 'AU', iso3: 'AUS', isoNumeric: '36' },
    { name: 'Austria', iso2: 'AT', iso3: 'AUT', isoNumeric: '40' },
    { name: 'Azerbaijan', iso2: 'AZ', iso3: 'AZE', isoNumeric: '31' },
    { name: 'Bahamas', iso2: 'BS', iso3: 'BHS', isoNumeric: '44' },
    { name: 'Bahrain', iso2: 'BH', iso3: 'BHR', isoNumeric: '48' },
    { name: 'Bangladesh', iso2: 'BD', iso3: 'BGD', isoNumeric: '50' },
    { name: 'Barbados', iso2: 'BB', iso3: 'BRB', isoNumeric: '52' },
    { name: 'Belarus', iso2: 'BY', iso3: 'BLR', isoNumeric: '112' },
    { name: 'Belgium', iso2: 'BE', iso3: 'BEL', isoNumeric: '56' },
    { name: 'Belize', iso2: 'BZ', iso3: 'BLZ', isoNumeric: '84' },
    { name: 'Benin', iso2: 'BJ', iso3: 'BEN', isoNumeric: '204' },
    { name: 'Bermuda', iso2: 'BM', iso3: 'BMU', isoNumeric: '60' },
    { name: 'Bhutan', iso2: 'BT', iso3: 'BTN', isoNumeric: '64' },
    { name: 'Bolivia, Plurinational State of', iso2: 'BO', iso3: 'BOL', isoNumeric: '68' },
    { name: 'Bolivia', iso2: 'BO', iso3: 'BOL', isoNumeric: '68' },
    { name: 'Bonaire, Sint Eustatius and Saba', iso2: 'BQ', iso3: 'BES', isoNumeric: '535' },
    { name: 'Bosnia and Herzegovina', iso2: 'BA', iso3: 'BIH', isoNumeric: '70' },
    { name: 'Botswana', iso2: 'BW', iso3: 'BWA', isoNumeric: '72' },
    { name: 'Bouvet Island', iso2: 'BV', iso3: 'BVT', isoNumeric: '74' },
    { name: 'Brazil', iso2: 'BR', iso3: 'BRA', isoNumeric: '76' },
    { name: 'British Indian Ocean Territory', iso2: 'IO', iso3: 'IOT', isoNumeric: '86' },
    { name: 'Brunei Darussalam', iso2: 'BN', iso3: 'BRN', isoNumeric: '96' },
    { name: 'Bulgaria', iso2: 'BG', iso3: 'BGR', isoNumeric: '100' },
    { name: 'Burkina Faso', iso2: 'BF', iso3: 'BFA', isoNumeric: '854' },
    { name: 'Burundi', iso2: 'BI', iso3: 'BDI', isoNumeric: '108' },
    { name: 'Cambodia', iso2: 'KH', iso3: 'CPV', isoNumeric: '132' },
    { name: 'Cameroon', iso2: 'CM', iso3: 'KHM', isoNumeric: '116' },
    { name: 'Canada', iso2: 'CA', iso3: 'CMR', isoNumeric: '120' },
    { name: 'Cape Verde', iso2: 'CV', iso3: 'CAN', isoNumeric: '124' },
    { name: 'Cayman Islands', iso2: 'KY', iso3: 'CYM', isoNumeric: '136' },
    { name: 'Central African Republic', iso2: 'CF', iso3: 'CAF', isoNumeric: '140' },
    { name: 'Chad', iso2: 'TD', iso3: 'TCD', isoNumeric: '148' },
    { name: 'Chile', iso2: 'CL', iso3: 'CHL', isoNumeric: '152' },
    { name: 'China', iso2: 'CN', iso3: 'CHN', isoNumeric: '156' },
    { name: 'Christmas Island', iso2: 'CX', iso3: 'CXR', isoNumeric: '162' },
    { name: 'Cocos (Keeling) Islands', iso2: 'CC', iso3: 'CCK', isoNumeric: '166' },
    { name: 'Colombia', iso2: 'CO', iso3: 'COL', isoNumeric: '170' },
    { name: 'Comoros', iso2: 'KM', iso3: 'COM', isoNumeric: '174' },
    { name: 'Congo', iso2: 'CG', iso3: 'COG', isoNumeric: '178' },
    { name: 'Congo, the Democratic Republic of the', iso2: 'CD', iso3: 'COD', isoNumeric: '180' },
    { name: 'Cook Islands', iso2: 'CK', iso3: 'COK', isoNumeric: '184' },
    { name: 'Costa Rica', iso2: 'CR', iso3: 'CRI', isoNumeric: '188' },
    { name: 'Côte d\'Ivoire', iso2: 'CI', iso3: 'CIV', isoNumeric: '384' },
    { name: 'Croatia', iso2: 'HR', iso3: 'HRV', isoNumeric: '191' },
    { name: 'Cuba', iso2: 'CU', iso3: 'CUB', isoNumeric: '192' },
    { name: 'Curaçao', iso2: 'CW', iso3: 'CUW', isoNumeric: '531' },
    { name: 'Cyprus', iso2: 'CY', iso3: 'CYP', isoNumeric: '196' },
    { name: 'Czech Republic', iso2: 'CZ', iso3: 'CZE', isoNumeric: '203' },
    { name: 'Czechia', iso2: 'CZ', iso3: 'CZE', isoNumeric: '203' },
    { name: 'Denmark', iso2: 'DK', iso3: 'DNK', isoNumeric: '208' },
    { name: 'Djibouti', iso2: 'DJ', iso3: 'DJI', isoNumeric: '262' },
    { name: 'Dominica', iso2: 'DM', iso3: 'DMA', isoNumeric: '212' },
    { name: 'Dominican Republic', iso2: 'DO', iso3: 'DOM', isoNumeric: '214' },
    { name: 'Ecuador', iso2: 'EC', iso3: 'ECU', isoNumeric: '218' },
    { name: 'Egypt', iso2: 'EG', iso3: 'EGY', isoNumeric: '818' },
    { name: 'El Salvador', iso2: 'SV', iso3: 'SLV', isoNumeric: '222' },
    { name: 'Equatorial Guinea', iso2: 'GQ', iso3: 'GNQ', isoNumeric: '226' },
    { name: 'Eritrea', iso2: 'ER', iso3: 'ERI', isoNumeric: '232' },
    { name: 'Estonia', iso2: 'EE', iso3: 'EST', isoNumeric: '233' },
    { name: 'Ethiopia', iso2: 'ET', iso3: 'ETH', isoNumeric: '231' },
    { name: 'Falkland Islands (Malvinas)', iso2: 'FK', iso3: 'FLK', isoNumeric: '238' },
    { name: 'Faroe Islands', iso2: 'FO', iso3: 'FRO', isoNumeric: '234' },
    { name: 'Fiji', iso2: 'FJ', iso3: 'FJI', isoNumeric: '242' },
    { name: 'Finland', iso2: 'FI', iso3: 'FIN', isoNumeric: '246' },
    { name: 'France', iso2: 'FR', iso3: 'FRA', isoNumeric: '250' },
    { name: 'French Guiana', iso2: 'GF', iso3: 'GUF', isoNumeric: '254' },
    { name: 'French Polynesia', iso2: 'PF', iso3: 'PYF', isoNumeric: '258' },
    { name: 'French Southern Territories', iso2: 'TF', iso3: 'ATF', isoNumeric: '260' },
    { name: 'Gabon', iso2: 'GA', iso3: 'GAB', isoNumeric: '266' },
    { name: 'Gambia', iso2: 'GM', iso3: 'GMB', isoNumeric: '270' },
    { name: 'Georgia', iso2: 'GE', iso3: 'GEO', isoNumeric: '268' },
    { name: 'Germany', iso2: 'DE', iso3: 'DEU', isoNumeric: '276' },
    { name: 'Ghana', iso2: 'GH', iso3: 'GHA', isoNumeric: '288' },
    { name: 'Gibraltar', iso2: 'GI', iso3: 'GIB', isoNumeric: '292' },
    { name: 'Greece', iso2: 'GR', iso3: 'GRC', isoNumeric: '300' },
    { name: 'Greenland', iso2: 'GL', iso3: 'GRL', isoNumeric: '304' },
    { name: 'Grenada', iso2: 'GD', iso3: 'GRD', isoNumeric: '308' },
    { name: 'Guadeloupe', iso2: 'GP', iso3: 'GLP', isoNumeric: '312' },
    { name: 'Guam', iso2: 'GU', iso3: 'GUM', isoNumeric: '316' },
    { name: 'Guatemala', iso2: 'GT', iso3: 'GTM', isoNumeric: '320' },
    { name: 'Guernsey', iso2: 'GG', iso3: 'GGY', isoNumeric: '831' },
    { name: 'Guinea', iso2: 'GN', iso3: 'GIN', isoNumeric: '324' },
    { name: 'Guinea-Bissau', iso2: 'GW', iso3: 'GNB', isoNumeric: '624' },
    { name: 'Guyana', iso2: 'GY', iso3: 'GUY', isoNumeric: '328' },
    { name: 'Haiti', iso2: 'HT', iso3: 'HTI', isoNumeric: '332' },
    { name: 'Heard Island and McDonald Islands', iso2: 'HM', iso3: 'HMD', isoNumeric: '334' },
    { name: 'Holy See (Vatican City State)', iso2: 'VA', iso3: 'VAT', isoNumeric: '336' },
    { name: 'Honduras', iso2: 'HN', iso3: 'HND', isoNumeric: '340' },
    { name: 'Hong Kong', iso2: 'HK', iso3: 'HKG', isoNumeric: '344' },
    { name: 'Hungary', iso2: 'HU', iso3: 'HUN', isoNumeric: '348' },
    { name: 'Iceland', iso2: 'IS', iso3: 'ISL', isoNumeric: '352' },
    { name: 'India', iso2: 'IN', iso3: 'IND', isoNumeric: '356' },
    { name: 'Indonesia', iso2: 'ID', iso3: 'IDN', isoNumeric: '360' },
    { name: 'Iran, Islamic Republic of', iso2: 'IR', iso3: 'IRN', isoNumeric: '364' },
    { name: 'Iraq', iso2: 'IQ', iso3: 'IRQ', isoNumeric: '368' },
    { name: 'Ireland', iso2: 'IE', iso3: 'IRL', isoNumeric: '372' },
    { name: 'Isle of Man', iso2: 'IM', iso3: 'IMN', isoNumeric: '833' },
    { name: 'Israel', iso2: 'IL', iso3: 'ISR', isoNumeric: '376' },
    { name: 'Italy', iso2: 'IT', iso3: 'ITA', isoNumeric: '380' },
    { name: 'Jamaica', iso2: 'JM', iso3: 'JAM', isoNumeric: '388' },
    { name: 'Japan', iso2: 'JP', iso3: 'JPN', isoNumeric: '392' },
    { name: 'Jersey', iso2: 'JE', iso3: 'JEY', isoNumeric: '832' },
    { name: 'Jordan', iso2: 'JO', iso3: 'JOR', isoNumeric: '400' },
    { name: 'Kazakhstan', iso2: 'KZ', iso3: 'KAZ', isoNumeric: '398' },
    { name: 'Kenya', iso2: 'KE', iso3: 'KEN', isoNumeric: '404' },
    { name: 'Kiribati', iso2: 'KI', iso3: 'KIR', isoNumeric: '296' },
    { name: 'Korea, Democratic People\'s Republic of', iso2: 'KP', iso3: 'PRK', isoNumeric: '408' },
    { name: 'Korea, Republic of', iso2: 'KR', iso3: 'KOR', isoNumeric: '410' },
    { name: 'Kuwait', iso2: 'KW', iso3: 'KWT', isoNumeric: '414' },
    { name: 'Kyrgyzstan', iso2: 'KG', iso3: 'KGZ', isoNumeric: '417' },
    { name: 'Lao People\'s Democratic Republic', iso2: 'LA', iso3: 'LAO', isoNumeric: '418' },
    { name: 'Latvia', iso2: 'LV', iso3: 'LVA', isoNumeric: '428' },
    { name: 'Lebanon', iso2: 'LB', iso3: 'LBN', isoNumeric: '422' },
    { name: 'Lesotho', iso2: 'LS', iso3: 'LSO', isoNumeric: '426' },
    { name: 'Liberia', iso2: 'LR', iso3: 'LBR', isoNumeric: '430' },
    { name: 'Libya', iso2: 'LY', iso3: 'LBY', isoNumeric: '434' },
    { name: 'Liechtenstein', iso2: 'LI', iso3: 'LIE', isoNumeric: '438' },
    { name: 'Lithuania', iso2: 'LT', iso3: 'LTU', isoNumeric: '440' },
    { name: 'Republic of Lithuania', iso2: 'LT', iso3: 'LTU', isoNumeric: '440' },
    { name: 'Luxembourg', iso2: 'LU', iso3: 'LUX', isoNumeric: '442' },
    { name: 'Macao', iso2: 'MO', iso3: 'MAC', isoNumeric: '446' },
    { name: 'Macedonia, the Former Yugoslav Republic of', iso2: 'MK', iso3: 'MKD', isoNumeric: '807' },
    { name: 'Macedonia', iso2: 'MK', iso3: 'MKD', isoNumeric: '807' },
    { name: 'Madagascar', iso2: 'MG', iso3: 'MDG', isoNumeric: '450' },
    { name: 'Malawi', iso2: 'MW', iso3: 'MWI', isoNumeric: '454' },
    { name: 'Malaysia', iso2: 'MY', iso3: 'MYS', isoNumeric: '458' },
    { name: 'Maldives', iso2: 'MV', iso3: 'MDV', isoNumeric: '462' },
    { name: 'Mali', iso2: 'ML', iso3: 'MLI', isoNumeric: '466' },
    { name: 'Malta', iso2: 'MT', iso3: 'MLT', isoNumeric: '470' },
    { name: 'Marshall Islands', iso2: 'MH', iso3: 'MHL', isoNumeric: '584' },
    { name: 'Martinique', iso2: 'MQ', iso3: 'MTQ', isoNumeric: '474' },
    { name: 'Mauritania', iso2: 'MR', iso3: 'MRT', isoNumeric: '478' },
    { name: 'Mauritius', iso2: 'MU', iso3: 'MUS', isoNumeric: '480' },
    { name: 'Mayotte', iso2: 'YT', iso3: 'MYT', isoNumeric: '175' },
    { name: 'Mexico', iso2: 'MX', iso3: 'MEX', isoNumeric: '484' },
    { name: 'Micronesia, Federated States of', iso2: 'FM', iso3: 'FSM', isoNumeric: '583' },
    { name: 'Moldova, Republic of', iso2: 'MD', iso3: 'MDA', isoNumeric: '498' },
    { name: 'Monaco', iso2: 'MC', iso3: 'MCO', isoNumeric: '492' },
    { name: 'Mongolia', iso2: 'MN', iso3: 'MNG', isoNumeric: '496' },
    { name: 'Montenegro', iso2: 'ME', iso3: 'MNE', isoNumeric: '499' },
    { name: 'Montserrat', iso2: 'MS', iso3: 'MSR', isoNumeric: '500' },
    { name: 'Morocco', iso2: 'MA', iso3: 'MAR', isoNumeric: '504' },
    { name: 'Mozambique', iso2: 'MZ', iso3: 'MOZ', isoNumeric: '508' },
    { name: 'Myanmar', iso2: 'MM', iso3: 'MMR', isoNumeric: '104' },
    { name: 'Namibia', iso2: 'NA', iso3: 'NAM', isoNumeric: '516' },
    { name: 'Nauru', iso2: 'NR', iso3: 'NRU', isoNumeric: '520' },
    { name: 'Nepal', iso2: 'NP', iso3: 'NPL', isoNumeric: '524' },
    { name: 'Netherlands', iso2: 'NL', iso3: 'NLD', isoNumeric: '528' },
    { name: 'New Caledonia', iso2: 'NC', iso3: 'NCL', isoNumeric: '540' },
    { name: 'New Zealand', iso2: 'NZ', iso3: 'NZL', isoNumeric: '554' },
    { name: 'Nicaragua', iso2: 'NI', iso3: 'NIC', isoNumeric: '558' },
    { name: 'Niger', iso2: 'NE', iso3: 'NER', isoNumeric: '562' },
    { name: 'Nigeria', iso2: 'NG', iso3: 'NGA', isoNumeric: '566' },
    { name: 'Niue', iso2: 'NU', iso3: 'NIU', isoNumeric: '570' },
    { name: 'Norfolk Island', iso2: 'NF', iso3: 'NFK', isoNumeric: '574' },
    { name: 'Northern Mariana Islands', iso2: 'MP', iso3: 'MNP', isoNumeric: '580' },
    { name: 'Norway', iso2: 'NO', iso3: 'NOR', isoNumeric: '578' },
    { name: 'Oman', iso2: 'OM', iso3: 'OMN', isoNumeric: '512' },
    { name: 'Pakistan', iso2: 'PK', iso3: 'PAK', isoNumeric: '586' },
    { name: 'Palau', iso2: 'PW', iso3: 'PLW', isoNumeric: '585' },
    { name: 'Palestine, State of', iso2: 'PS', iso3: 'PSE', isoNumeric: '275' },
    { name: 'Panama', iso2: 'PA', iso3: 'PAN', isoNumeric: '591' },
    { name: 'Papua New Guinea', iso2: 'PG', iso3: 'PNG', isoNumeric: '598' },
    { name: 'Paraguay', iso2: 'PY', iso3: 'PRY', isoNumeric: '600' },
    { name: 'Peru', iso2: 'PE', iso3: 'PER', isoNumeric: '604' },
    { name: 'Philippines', iso2: 'PH', iso3: 'PHL', isoNumeric: '608' },
    { name: 'Pitcairn', iso2: 'PN', iso3: 'PCN', isoNumeric: '612' },
    { name: 'Poland', iso2: 'PL', iso3: 'POL', isoNumeric: '616' },
    { name: 'Portugal', iso2: 'PT', iso3: 'PRT', isoNumeric: '620' },
    { name: 'Puerto Rico', iso2: 'PR', iso3: 'PRI', isoNumeric: '630' },
    { name: 'Qatar', iso2: 'QA', iso3: 'QAT', isoNumeric: '634' },
    { name: 'Réunion', iso2: 'RE', iso3: 'REU', isoNumeric: '638' },
    { name: 'Romania', iso2: 'RO', iso3: 'ROU', isoNumeric: '642' },
    { name: 'Russian Federation', iso2: 'RU', iso3: 'RUS', isoNumeric: '643' },
    { name: 'Russia', iso2: 'RU', iso3: 'RUS', isoNumeric: '643' },
    { name: 'Rwanda', iso2: 'RW', iso3: 'RWA', isoNumeric: '646' },
    { name: 'Saint Barthélemy', iso2: 'BL', iso3: 'BLM', isoNumeric: '652' },
    { name: 'Saint Helena, Ascension and Tristan da Cunha', iso2: 'SH', iso3: 'SHN', isoNumeric: '654' },
    { name: 'Saint Kitts and Nevis', iso2: 'KN', iso3: 'KNA', isoNumeric: '659' },
    { name: 'Saint Lucia', iso2: 'LC', iso3: 'LCA', isoNumeric: '662' },
    { name: 'Saint Martin (French part)', iso2: 'MF', iso3: 'MAF', isoNumeric: '663' },
    { name: 'Saint Pierre and Miquelon', iso2: 'PM', iso3: 'SPM', isoNumeric: '666' },
    { name: 'Saint Vincent and the Grenadines', iso2: 'VC', iso3: 'VCT', isoNumeric: '670' },
    { name: 'Samoa', iso2: 'WS', iso3: 'WSM', isoNumeric: '882' },
    { name: 'San Marino', iso2: 'SM', iso3: 'SMR', isoNumeric: '674' },
    { name: 'Sao Tome and Principe', iso2: 'ST', iso3: 'STP', isoNumeric: '678' },
    { name: 'Saudi Arabia', iso2: 'SA', iso3: 'SAU', isoNumeric: '682' },
    { name: 'Senegal', iso2: 'SN', iso3: 'SEN', isoNumeric: '686' },
    { name: 'Serbia', iso2: 'RS', iso3: 'SRB', isoNumeric: '688' },
    { name: 'Seychelles', iso2: 'SC', iso3: 'SYC', isoNumeric: '690' },
    { name: 'Sierra Leone', iso2: 'SL', iso3: 'SLE', isoNumeric: '694' },
    { name: 'Singapore', iso2: 'SG', iso3: 'SGP', isoNumeric: '702' },
    { name: 'Sint Maarten (Dutch part)', iso2: 'SX', iso3: 'SXM', isoNumeric: '534' },
    { name: 'Slovakia', iso2: 'SK', iso3: 'SVK', isoNumeric: '703' },
    { name: 'Slovenia', iso2: 'SI', iso3: 'SVN', isoNumeric: '705' },
    { name: 'Solomon Islands', iso2: 'SB', iso3: 'SLB', isoNumeric: '90' },
    { name: 'Somalia', iso2: 'SO', iso3: 'SOM', isoNumeric: '706' },
    { name: 'South Africa', iso2: 'ZA', iso3: 'ZAF', isoNumeric: '710' },
    { name: 'South Georgia and the South Sandwich Islands', iso2: 'GS', iso3: 'SGS', isoNumeric: '239' },
    { name: 'South Sudan', iso2: 'SS', iso3: 'SSD', isoNumeric: '728' },
    { name: 'Spain', iso2: 'ES', iso3: 'ESP', isoNumeric: '724' },
    { name: 'Sri Lanka', iso2: 'LK', iso3: 'LKA', isoNumeric: '144' },
    { name: 'Sudan', iso2: 'SD', iso3: 'SDN', isoNumeric: '729' },
    { name: 'Suriname', iso2: 'SR', iso3: 'SUR', isoNumeric: '740' },
    { name: 'Svalbard and Jan Mayen', iso2: 'SJ', iso3: 'SJM', isoNumeric: '744' },
    { name: 'Swaziland', iso2: 'SZ', iso3: 'SWZ', isoNumeric: '748' },
    { name: 'Sweden', iso2: 'SE', iso3: 'SWE', isoNumeric: '752' },
    { name: 'Switzerland', iso2: 'CH', iso3: 'CHE', isoNumeric: '756' },
    { name: 'Syrian Arab Republic', iso2: 'SY', iso3: 'SYR', isoNumeric: '760' },
    { name: 'Taiwan, Province of China', iso2: 'TW', iso3: 'TWN', isoNumeric: '158' },
    { name: 'Taiwan', iso2: 'TW', iso3: 'TWN', isoNumeric: '158' },
    { name: 'Tajikistan', iso2: 'TJ', iso3: 'TJK', isoNumeric: '762' },
    { name: 'Tanzania, United Republic of', iso2: 'TZ', iso3: 'TZA', isoNumeric: '834' },
    { name: 'Thailand', iso2: 'TH', iso3: 'THA', isoNumeric: '764' },
    { name: 'Timor-Leste', iso2: 'TL', iso3: 'TLS', isoNumeric: '626' },
    { name: 'Togo', iso2: 'TG', iso3: 'TGO', isoNumeric: '768' },
    { name: 'Tokelau', iso2: 'TK', iso3: 'TKL', isoNumeric: '772' },
    { name: 'Tonga', iso2: 'TO', iso3: 'TON', isoNumeric: '776' },
    { name: 'Trinidad and Tobago', iso2: 'TT', iso3: 'TTO', isoNumeric: '780' },
    { name: 'Tunisia', iso2: 'TN', iso3: 'TUN', isoNumeric: '788' },
    { name: 'Turkey', iso2: 'TR', iso3: 'TUR', isoNumeric: '792' },
    { name: 'Turkmenistan', iso2: 'TM', iso3: 'TKM', isoNumeric: '795' },
    { name: 'Turks and Caicos Islands', iso2: 'TC', iso3: 'TCA', isoNumeric: '796' },
    { name: 'Tuvalu', iso2: 'TV', iso3: 'TUV', isoNumeric: '798' },
    { name: 'Uganda', iso2: 'UG', iso3: 'UGA', isoNumeric: '800' },
    { name: 'Ukraine', iso2: 'UA', iso3: 'UKR', isoNumeric: '804' },
    { name: 'United Arab Emirates', iso2: 'AE', iso3: 'ARE', isoNumeric: '784' },
    { name: 'United Kingdom', iso2: 'GB', iso3: 'GBR', isoNumeric: '826' },
    { name: 'United States', iso2: 'US', iso3: 'USA', isoNumeric: '840' },
    { name: 'United States Minor Outlying Islands', iso2: 'UM', iso3: 'UMI', isoNumeric: '581' },
    { name: 'Uruguay', iso2: 'UY', iso3: 'URY', isoNumeric: '858' },
    { name: 'Uzbekistan', iso2: 'UZ', iso3: 'UZB', isoNumeric: '860' },
    { name: 'Vanuatu', iso2: 'VU', iso3: 'VUT', isoNumeric: '548' },
    { name: 'Venezuela, Bolivarian Republic of', iso2: 'VE', iso3: 'VEN', isoNumeric: '862' },
    { name: 'Venezuela', iso2: 'VE', iso3: 'VEN', isoNumeric: '862' },
    { name: 'Viet Nam', iso2: 'VN', iso3: 'VNM', isoNumeric: '704' },
    { name: 'Vietnam', iso2: 'VN', iso3: 'VNM', isoNumeric: '704' },
    { name: 'Virgin Islands, British', iso2: 'VG', iso3: 'VGB', isoNumeric: '92' },
    { name: 'Virgin Islands, U.S.', iso2: 'VI', iso3: 'VIR', isoNumeric: '850' },
    { name: 'Wallis and Futuna', iso2: 'WF', iso3: 'WLF', isoNumeric: '876' },
    { name: 'Western Sahara', iso2: 'EH', iso3: 'ESH', isoNumeric: '732' },
    { name: 'Yemen', iso2: 'YE', iso3: 'YEM', isoNumeric: '887' },
    { name: 'Zambia', iso2: 'ZM', iso3: 'ZMB', isoNumeric: '894' },
    { name: 'Zimbabwe', iso2: 'ZW', iso3: 'ZWE', isoNumeric: '716' },
];


export const ColorPickerConfig = [
    {
        class: 'Transparent',
        color: 'transparent'
    },
    {
        class: 'White',
        color: 0xFFFFFF
    },
    {
        class: 'Blue',
        color: 0x0099EF
    },
    {
        class: 'Purple',
        color: 0x9642F8
    },
    {
        class: 'Red',
        color: 0xF93646
    },
    {
        class: 'Orange',
        color: 0xFF893F
    },
    {
        class: 'Yellow',
        color: 0xFFD93C
    },
    {
        class: 'Green',
        color: 0x00D27C
    },
    {
        class: 'Teal',
        color: 0x1CD3D2
    },
    {
        class: 'Black',
        color: 0x1E2531
    },
    {
        class: 'Grey',
        color: 0xBEBEBE
    }
];

export const IconsConfig = {
    'PAGE': [
        {
            name: 'Generic Page',
            srcPixi: '/asset/StepsModal/Pages/',
            src: '/asset/react/Pages/'
        },
        {
            name: 'Download',
            srcPixi: '/asset/StepsModal/Pages/',
            src: '/asset/react/Pages/'
        },
        {
            name: 'Opt In',
            src: '/asset/react/Pages/',
            srcPixi: '/asset/StepsModal/Pages/',
        },
        {
            name: 'Order Page',
            srcPixi: '/asset/StepsModal/Pages/',
            src: '/asset/react/Pages/'
        },
        {
            name: 'Sales Page',
            srcPixi: '/asset/StepsModal/Pages/',
            src: '/asset/react/Pages/'
        },
        {
            name: 'Sales Page Video',
            srcPixi: '/asset/StepsModal/Pages/',
            src: '/asset/react/Pages/'
        },
        {
            name: 'Calendar',
            srcPixi: '/asset/StepsModal/Pages/',
            src: '/asset/react/Pages/'
        },
        {
            name: 'Survey',
            srcPixi: '/asset/StepsModal/Pages/',
            src: '/asset/react/Pages/'
        },
        {
            name: 'Upsell Oto',
            srcPixi: '/asset/StepsModal/Pages/',
            src: '/asset/react/Pages/'
        },
        {
            name: 'Webinar Live',
            srcPixi: '/asset/StepsModal/Pages/',
            src: '/asset/react/Pages/'
        },
        {
            name: 'Webinar Replay',
            srcPixi: '/asset/StepsModal/Pages/',
            src: '/asset/react/Pages/'
        },
        {
            name: 'Blog Post',
            srcPixi: '/asset/StepsModal/Pages/',
            src: '/asset/react/Pages/'
        },
        {
            name: 'Members Area',
            srcPixi: '/asset/StepsModal/Pages/',
            src: '/asset/react/Pages/'
        },
        {
            name: 'Thank You',
            srcPixi: '/asset/StepsModal/Pages/',
            src: '/asset/react/Pages/'
        },
        {
            name: 'Popup',
            srcPixi: '/asset/StepsModal/Pages/',
            src: '/asset/react/Pages/'
        },
    ],
    'SPECIAL_EVENT': [
      {
        name: 'Purchase',
        srcPixi: '/asset/StepsModal/Actions/',
        src: '/asset/react/Actions/',
        id: COMMERCE_ACTION_NAME,
      },
      {
        name: 'Lead',
        srcPixi: '/asset/StepsModal/Actions/',
        src: '/asset/react/Actions/'
      },
    ],
    'EVENT': [
        {
            name: 'Add To Cart',
            srcPixi: '/asset/StepsModal/Actions/',
            src: '/asset/react/Actions/'
        },
        {
            name: 'Click',
            srcPixi: '/asset/StepsModal/Actions/',
            src: '/asset/react/Actions/'
        },
        {
            name: 'Popup',
            srcPixi: '/asset/StepsModal/Actions/',
            src: '/asset/react/Actions/'
        },
        {
            name: 'Add Tag',
            srcPixi: '/asset/StepsModal/Actions/',
            src: '/asset/react/Actions/'
        },
        {
            name: 'Add To List',
            srcPixi: '/asset/StepsModal/Actions/',
            src: '/asset/react/Actions/'
        },
        {
            name: 'Contact',
            srcPixi: '/asset/StepsModal/Actions/',
            src: '/asset/react/Actions/'
        },
        {
            name: 'Request Contact',
            srcPixi: '/asset/StepsModal/Actions/',
            src: '/asset/react/Actions/'
        },
        {
            name: 'Request Info',
            srcPixi: '/asset/StepsModal/Actions/',
            src: '/asset/react/Actions/'
        },
        {
            name: 'Schedule Meeting',
            srcPixi: '/asset/StepsModal/Actions/',
            src: '/asset/react/Actions/'
        },
        {
            name: 'Scroll',
            srcPixi: '/asset/StepsModal/Actions/',
            src: '/asset/react/Actions/'
        },
        {
            name: 'Watch Video',
            srcPixi: '/asset/StepsModal/Actions/',
            src: '/asset/react/Actions/'
        }
    ],
    'SOURCE': [
        {
            name: 'Ad Network',
            srcPixi: '/asset/StepsModal/Sources/',
            src: '/asset/react/Sources/'
        },
        {
            name: 'Affiliate Program',
            srcPixi: '/asset/StepsModal/Sources/',
            src: '/asset/react/Sources/'
        },
        {
            name: 'Amazon',
            srcPixi: '/asset/StepsModal/Sources/',
            src: '/asset/react/Sources/'
        },
        {
            name: 'Banner',
            srcPixi: '/asset/StepsModal/Sources/',
            src: '/asset/react/Sources/'
        },
        {
            name: 'Bing',
            srcPixi: '/asset/StepsModal/Sources/',
            src: '/asset/react/Sources/'
        },
        {
            name: 'Biz Directory',
            srcPixi: '/asset/StepsModal/Sources/',
            src: '/asset/react/Sources/'
        },
        {
            name: 'Career Site',
            srcPixi: '/asset/StepsModal/Sources/',
            src: '/asset/react/Sources/'
        },
        {
            name: 'Chatbot',
            srcPixi: '/asset/StepsModal/Sources/',
            src: '/asset/react/Sources/'
        },
        {
            name: 'Chat Box',
            srcPixi: '/asset/StepsModal/Sources/',
            src: '/asset/react/Sources/'
        },
        {
            name: 'Clutch',
            srcPixi: '/asset/StepsModal/Sources/',
            src: '/asset/react/Sources/'
        },
        {
            name: 'Email',
            srcPixi: '/asset/StepsModal/Sources/',
            src: '/asset/react/Sources/'
        },
        {
            name: 'Facebook',
            srcPixi: '/asset/StepsModal/Sources/',
            src: '/asset/react/Sources/'
        },
        {
            name: 'Facebook Ad',
            srcPixi: '/asset/StepsModal/Sources/',
            src: '/asset/react/Sources/'
        },
        {
            name: 'Facebook Post',
            srcPixi: '/asset/StepsModal/Sources/',
            src: '/asset/react/Sources/'
        },
        {
            name: 'Gmail',
            srcPixi: '/asset/StepsModal/Sources/',
            src: '/asset/react/Sources/'
        },
        {
            name: 'Google',
            srcPixi: '/asset/StepsModal/Sources/',
            src: '/asset/react/Sources/'
        },
        {
            name: 'Google Ads',
            srcPixi: '/asset/StepsModal/Sources/',
            src: '/asset/react/Sources/'
        },
        {
            name: 'Google Maps',
            srcPixi: '/asset/StepsModal/Sources/',
            src: '/asset/react/Sources/'
        },
        {
            name: 'Guest Blog',
            srcPixi: '/asset/StepsModal/Sources/',
            src: '/asset/react/Sources/'
        },
        {
            name: 'Instagram',
            srcPixi: '/asset/StepsModal/Sources/',
            src: '/asset/react/Sources/'
        },
        {
            name: 'Instagram Ad',
            srcPixi: '/asset/StepsModal/Sources/',
            src: '/asset/react/Sources/'
        },
        {
            name: 'Instagram Post',
            srcPixi: '/asset/StepsModal/Sources/',
            src: '/asset/react/Sources/'
        },
        {
            name: 'Instagram Story',
            srcPixi: '/asset/StepsModal/Sources/',
            src: '/asset/react/Sources/'
        },
        {
            name: 'Job Site',
            srcPixi: '/asset/StepsModal/Sources/',
            src: '/asset/react/Sources/'
        },
        {
            name: 'Linkedin',
            srcPixi: '/asset/StepsModal/Sources/',
            src: '/asset/react/Sources/'
        },
        {
            name: 'Linkedin Ad',
            srcPixi: '/asset/StepsModal/Sources/',
            src: '/asset/react/Sources/'
        },
        {
            name: 'Linkedin Post',
            srcPixi: '/asset/StepsModal/Sources/',
            src: '/asset/react/Sources/'
        },
        {
            name: 'Messenger',
            srcPixi: '/asset/StepsModal/Sources/',
            src: '/asset/react/Sources/'
        },
        {
            name: 'Messenger Bot',
            srcPixi: '/asset/StepsModal/Sources/',
            src: '/asset/react/Sources/'
        },
        {
            name: 'Microsoft Ads',
            srcPixi: '/asset/StepsModal/Sources/',
            src: '/asset/react/Sources/'
        },
        {
            name: 'Online Meeting',
            srcPixi: '/asset/StepsModal/Sources/',
            src: '/asset/react/Sources/'
        },
        {
            name: 'Pinterest',
            srcPixi: '/asset/StepsModal/Sources/',
            src: '/asset/react/Sources/'
        },
        {
            name: 'Reddit',
            srcPixi: '/asset/StepsModal/Sources/',
            src: '/asset/react/Sources/'
        },
        {
            name: 'Report',
            srcPixi: '/asset/StepsModal/Sources/',
            src: '/asset/react/Sources/'
        },
        {
            name: 'Search',
            srcPixi: '/asset/StepsModal/Sources/',
            src: '/asset/react/Sources/'
        },
        {
            name: 'Snapchat',
            srcPixi: '/asset/StepsModal/Sources/',
            src: '/asset/react/Sources/'
        },
        {
            name: 'Source',
            srcPixi: '/asset/StepsModal/Sources/',
            src: '/asset/react/Sources/'
        },
        {
            name: 'Spotify',
            srcPixi: '/asset/StepsModal/Sources/',
            src: '/asset/react/Sources/'
        },
        {
            name: 'Tiktok',
            srcPixi: '/asset/StepsModal/Sources/',
            src: '/asset/react/Sources/'
        },
        {
            name: 'Twitter',
            srcPixi: '/asset/StepsModal/Sources/',
            src: '/asset/react/Sources/'
        },
        {
            name: 'Yelp',
            srcPixi: '/asset/StepsModal/Sources/',
            src: '/asset/react/Sources/'
        },
        {
            name: 'Youtube',
            srcPixi: '/asset/StepsModal/Sources/',
            src: '/asset/react/Sources/'
        },
        {
            name: 'Youtube Ads',
            srcPixi: '/asset/StepsModal/Sources/',
            src: '/asset/react/Sources/'
        },
        {
            name: 'Youtube Series',
            srcPixi: '/asset/StepsModal/Sources/',
            src: '/asset/react/Sources/'
        }
    ],
    'MISC': [
        {
            name: 'Active Campaign',
            srcPixi: '/asset/StepsModal/Offline/',
            src: '/asset/react/Offline/'
        },
        {
            name: 'Billboard',
            srcPixi: '/asset/StepsModal/Offline/',
            src: '/asset/react/Offline/'
        },
        {
            name: 'Business Card',
            srcPixi: '/asset/StepsModal/Offline/',
            src: '/asset/react/Offline/'
        },
        {
            name: 'Clock',
            srcPixi: '/asset/StepsModal/Offline/',
            src: '/asset/react/Offline/'
        },
        {
            name: 'Conference',
            srcPixi: '/asset/StepsModal/Offline/',
            src: '/asset/react/Offline/'
        },
        {
            name: 'Constant Contact',
            srcPixi: '/asset/StepsModal/Offline/',
            src: '/asset/react/Offline/'
        },
        {
            name: 'Direct Mail',
            srcPixi: '/asset/StepsModal/Offline/',
            src: '/asset/react/Offline/'
        },
        {
            name: 'Drift',
            srcPixi: '/asset/StepsModal/Offline/',
            src: '/asset/react/Offline/'
        },
        {
            name: 'Drip',
            srcPixi: '/asset/StepsModal/Offline/',
            src: '/asset/react/Offline/'
        },
        {
            name: 'Go To Meeting',
            srcPixi: '/asset/StepsModal/Offline/',
            src: '/asset/react/Offline/'
        },
        {
            name: 'Hubspot',
            srcPixi: '/asset/StepsModal/Offline/',
            src: '/asset/react/Offline/'
        },
        {
            name: 'Insightly',
            srcPixi: '/asset/StepsModal/Offline/',
            src: '/asset/react/Offline/'
        },
        {
            name: 'Intercom',
            srcPixi: '/asset/StepsModal/Offline/',
            src: '/asset/react/Offline/'
        },
        {
            name: 'Job Interview',
            srcPixi: '/asset/StepsModal/Offline/',
            src: '/asset/react/Offline/'
        },
        {
            name: 'Keap',
            srcPixi: '/asset/StepsModal/Offline/',
            src: '/asset/react/Offline/'
        },
        {
            name: 'Mailchimp',
            srcPixi: '/asset/StepsModal/Offline/',
            src: '/asset/react/Offline/'
        },
        {
            name: 'Marketo',
            srcPixi: '/asset/StepsModal/Offline/',
            src: '/asset/react/Offline/'
        },
        {
            name: 'Meeting',
            srcPixi: '/asset/StepsModal/Offline/',
            src: '/asset/react/Offline/'
        },
        {
            name: 'Next Funnel',
            srcPixi: '/asset/StepsModal/Offline/',
            src: '/asset/react/Offline/'
        },
        {
            name: 'Ontraport',
            srcPixi: '/asset/StepsModal/Offline/',
            src: '/asset/react/Offline/'
        },
        {
            name: 'Phone',
            srcPixi: '/asset/StepsModal/Offline/',
            src: '/asset/react/Offline/'
        },
        {
            name: 'Pipedrive',
            srcPixi: '/asset/StepsModal/Offline/',
            src: '/asset/react/Offline/'
        },
        {
            name: 'Print Ad',
            srcPixi: '/asset/StepsModal/Offline/',
            src: '/asset/react/Offline/'
        },
        {
            name: 'Qr Code',
            srcPixi: '/asset/StepsModal/Offline/',
            src: '/asset/react/Offline/'
        },
        {
            name: 'Radio',
            srcPixi: '/asset/StepsModal/Offline/',
            src: '/asset/react/Offline/'
        },
        {
            name: 'Salesforce',
            srcPixi: '/asset/StepsModal/Offline/',
            src: '/asset/react/Offline/'
        },
        {
            name: 'Slack',
            srcPixi: '/asset/StepsModal/Offline/',
            src: '/asset/react/Offline/'
        },
        {
            name: 'Sms',
            srcPixi: '/asset/StepsModal/Offline/',
            src: '/asset/react/Offline/'
        },
        {
            name: 'Telegram',
            srcPixi: '/asset/StepsModal/Offline/',
            src: '/asset/react/Offline/'
        },
        {
            name: 'Tv Ad',
            srcPixi: '/asset/StepsModal/Offline/',
            src: '/asset/react/Offline/'
        },
        {
            name: 'Workshop Seminar',
            srcPixi: '/asset/StepsModal/Offline/',
            src: '/asset/react/Offline/'
        },
        {
            name: 'Zapier',
            srcPixi: '/asset/StepsModal/Offline/',
            src: '/asset/react/Offline/'
        },
        {
            name: 'Zendesk',
            srcPixi: '/asset/StepsModal/Offline/',
            src: '/asset/react/Offline/'
        },
        {
            name: 'Zoho',
            srcPixi: '/asset/StepsModal/Offline/',
            src: '/asset/react/Offline/'
        },
        {
            name: 'Zoom',
            srcPixi: '/asset/StepsModal/Offline/',
            src: '/asset/react/Offline/'
        }
    ]
};

