import { useState, useCallback } from 'react';
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from 'react-simple-maps';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Globe, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface PageView {
  country?: string;
  city?: string;
  created_at: string;
  ip_address?: string;
  page_path: string;
}

interface WorldMapProps {
  pageViews: PageView[];
}

// Country coordinates for major cities/regions
const countryCoordinates: Record<string, [number, number]> = {
  'United States': [-100, 40],
  'Canada': [-95, 60],
  'United Kingdom': [-2, 54],
  'Germany': [10, 51],
  'France': [2, 46],
  'Italy': [12, 42],
  'Spain': [-3, 40],
  'Netherlands': [5, 52],
  'Belgium': [4, 51],
  'Switzerland': [8, 47],
  'Austria': [14, 47],
  'Poland': [19, 52],
  'Sweden': [15, 62],
  'Norway': [10, 62],
  'Denmark': [9, 56],
  'Finland': [25, 62],
  'Greece': [22, 39],
  'Portugal': [-8, 39],
  'Ireland': [-8, 53],
  'Russia': [90, 60],
  'China': [105, 35],
  'Japan': [138, 36],
  'South Korea': [128, 36],
  'India': [77, 20],
  'Australia': [133, -27],
  'New Zealand': [174, -41],
  'Brazil': [-55, -10],
  'Argentina': [-64, -34],
  'Mexico': [-102, 23],
  'South Africa': [25, -29],
  'Egypt': [30, 26],
  'Nigeria': [8, 10],
  'Kenya': [38, -1],
  'Morocco': [-7, 32],
  'Turkey': [35, 39],
  'Israel': [34.8, 31],
  'Saudi Arabia': [45, 24],
  'UAE': [54, 24],
  'Iran': [53, 32],
  'Pakistan': [69, 30],
  'Bangladesh': [90, 24],
  'Indonesia': [113, -8],
  'Thailand': [101, 15],
  'Vietnam': [108, 14],
  'Philippines': [122, 13],
  'Malaysia': [101, 4],
  'Singapore': [103, 1],
  'Colombia': [-74, 4],
  'Venezuela': [-66, 8],
  'Chile': [-71, -30],
  'Peru': [-75, -10],
  'Uruguay': [-56, -33],
  'Paraguay': [-58, -23],
  'Bolivia': [-65, -17],
  'Ecuador': [-78, -2],
  'Guyana': [-59, 5],
  'Suriname': [-56, 4],
  'Cuba': [-79, 22],
  'Jamaica': [-77, 18],
  'Haiti': [-72, 19],
  'Dominican Republic': [-70, 19],
  'Guatemala': [-90, 15],
  'Costa Rica': [-84, 10],
  'Panama': [-80, 9],
  'Honduras': [-87, 15],
  'Nicaragua': [-85, 13],
  'El Salvador': [-89, 14],
  'Belarus': [28, 53],
  'Ukraine': [32, 48],
  'Romania': [25, 46],
  'Bulgaria': [25, 43],
  'Serbia': [21, 44],
  'Croatia': [16, 45],
  'Slovenia': [15, 46],
  'Estonia': [25, 59],
  'Latvia': [25, 57],
  'Lithuania': [24, 55],
  'Czech Republic': [15, 50],
  'Slovakia': [19, 48],
  'Hungary': [19, 47],
  'Moldova': [29, 47],
  'Cyprus': [33, 35],
  'Luxembourg': [6, 50],
  'Malta': [14, 36],
  'Iceland': [-19, 65],
  'Albania': [20, 41],
  'Macedonia': [22, 41],
  'Montenegro': [19, 42],
  'Bosnia': [18, 44],
  'Georgia': [43, 42],
  'Armenia': [45, 40],
  'Azerbaijan': [47, 40],
  'Kazakhstan': [68, 48],
  'Uzbekistan': [64, 41],
  'Turkmenistan': [60, 38],
  'Kyrgyzstan': [74, 41],
  'Tajikistan': [71, 39],
  'Afghanistan': [65, 33],
  'Iraq': [44, 33],
  'Syria': [37, 35],
  'Lebanon': [35, 34],
  'Jordan': [36, 31],
  'Kuwait': [48, 29],
  'Bahrain': [50, 26],
  'Qatar': [51, 25],
  'Oman': [54, 21],
  'Yemen': [48, 15],
  'Sri Lanka': [81, 7],
  'Myanmar': [96, 22],
  'Laos': [102, 18],
  'Cambodia': [105, 13],
  'Mongolia': [103, 46],
  'North Korea': [127, 40],
  'Nepal': [84, 28],
  'Bhutan': [90, 27],
  'Papua New Guinea': [143, -6],
  'Fiji': [178, -18],
  'Solomon Islands': [160, -8],
  'Vanuatu': [167, -17],
  'Samoa': [-172, -14],
  'Tonga': [-175, -21],
  'Kiribati': [173, 1],
  'Marshall Islands': [171, 7],
  'Micronesia': [158, 7],
  'Palau': [134, 7],
  'Tuvalu': [179, -8],
  'Nauru': [167, -0.5],
  'Barbados': [-59, 13],
  'Trinidad and Tobago': [-61, 11],
  'Bahamas': [-77, 25],
  'Dominica': [-61, 15],
  'Grenada': [-62, 12],
  'St. Lucia': [-61, 14],
  'St. Vincent': [-61, 13],
  'Antigua and Barbuda': [-62, 17],
  'St. Kitts and Nevis': [-62, 17],
  'St. Martin': [-63, 18],
  'Anguilla': [-63, 18],
  'British Virgin Islands': [-64, 18],
  'Cayman Islands': [-81, 19],
  'Turks and Caicos': [-71, 22],
  'Bermuda': [-65, 32],
  'Greenland': [-42, 71],
  'Faroe Islands': [-7, 62],
  'Guernsey': [-2, 49],
  'Jersey': [-2, 49],
  'Isle of Man': [-4, 54],
  'Gibraltar': [-5, 36],
  'Svalbard': [20, 78],
  'Jan Mayen': [-8, 71],
  'Western Sahara': [-13, 24],
  'Somalia': [49, 10],
  'Djibouti': [43, 12],
  'Eritrea': [39, 15],
  'Sudan': [30, 13],
  'Libya': [17, 25],
  'Tunisia': [9, 34],
  'Algeria': [2, 28],
  'Mali': [-3, 17],
  'Niger': [8, 16],
  'Chad': [19, 12],
  'Cameroon': [12, 4],
  'Congo': [15, -1],
  'DRC': [23, -4],
  'Uganda': [32, 1],
  'Rwanda': [30, -2],
  'Burundi': [30, -3],
  'Tanzania': [35, -6],
  'Zambia': [28, -14],
  'Malawi': [34, -14],
  'Mozambique': [35, -18],
  'Zimbabwe': [30, -20],
  'Botswana': [24, -22],
  'Namibia': [18, -22],
  'Angola': [17, -12],
  'Gabon': [12, -1],
  'Equatorial Guinea': [10, 1],
  'Sao Tome and Principe': [7, 1],
  'Cape Verde': [-24, 16],
  'Senegal': [-14, 14],
  'Gambia': [-15, 13],
  'Guinea-Bissau': [-15, 12],
  'Guinea': [-10, 10],
  'Sierra Leone': [-12, 9],
  'Liberia': [-10, 6],
  'Ivory Coast': [-5, 8],
  'Burkina Faso': [-2, 13],
  'Togo': [1, 8],
  'Benin': [2, 10],
  'Central African Republic': [21, 7],
  'South Sudan': [30, 7],
  'Ethiopia': [40, 9],
  'Somaliland': [47, 10],
  'Comoros': [44, -12],
  'Seychelles': [55, -4],
  'Mauritius': [57, -20],
  'Madagascar': [47, -20],
  'Reunion': [55, -21],
  'Mayotte': [45, -12],
  'Saint Helena': [-5, -16],
  'Ascension Island': [-14, -8],
  'Tristan da Cunha': [-12, -37],
  'Falkland Islands': [-59, -52],
  'South Georgia': [-37, -55],
  'French Southern Territories': [70, -49],
  'Heard Island and McDonald Islands': [77, -53],
  'Antarctica': [0, -75],
};

const geoUrl = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

export function WorldMap({ pageViews }: WorldMapProps) {
  const [zoom, setZoom] = useState(1);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [hoveredMarker, setHoveredMarker] = useState<PageView | null>(null);

  // Group page views by country and get coordinates
  const locationData = pageViews.reduce((acc: Record<string, { count: number; views: PageView[]; coordinates: [number, number] }>, view) => {
    const country = view.country || 'Unknown';
    if (!acc[country] && countryCoordinates[country]) {
      acc[country] = {
        count: 0,
        views: [],
        coordinates: countryCoordinates[country]
      };
    }
    if (acc[country]) {
      acc[country].count++;
      acc[country].views.push(view);
    }
    return acc;
  }, {});

  const locations = Object.entries(locationData).map(([country, data]) => ({
    country,
    count: data.count,
    views: data.views,
    coordinates: data.coordinates
  }));

  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev + 0.5, 8));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev - 0.5, 1));
  }, []);

  const handleReset = useCallback(() => {
    setZoom(1);
    setSelectedCountry(null);
  }, []);

  const getMarkerSize = (count: number) => {
    const minSize = 4;
    const maxSize = 20;
    const maxCount = Math.max(...locations.map(loc => loc.count));
    return minSize + (count / maxCount) * (maxSize - minSize);
  };

  const getMarkerColor = (count: number) => {
    const maxCount = Math.max(...locations.map(loc => loc.count));
    const intensity = count / maxCount;
    if (intensity > 0.7) return '#ef4444'; // red
    if (intensity > 0.4) return '#f59e0b'; // amber
    if (intensity > 0.2) return '#10b981'; // emerald
    return '#3b82f6'; // blue
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Global View Distribution
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleZoomIn}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleZoomOut}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative w-full h-[500px] bg-slate-50 dark:bg-slate-900 rounded-lg overflow-hidden">
          <ComposableMap
            projection="geoMercator"
            projectionConfig={{
              scale: 147,
              center: [0, 0]
            }}
          >
            <ZoomableGroup zoom={zoom} minZoom={1} maxZoom={8}>
              <Geographies geography={geoUrl}>
                {({ geographies }) =>
                  geographies.map((geo) => {
                    const isSelected = selectedCountry === geo.properties.name;
                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill={isSelected ? "hsl(var(--primary))" : "#e5e7eb"}
                        stroke="#9ca3af"
                        strokeWidth={isSelected ? 2 : 1}
                        style={{
                          default: {
                            fill: isSelected ? "hsl(var(--primary))" : "#e5e7eb",
                            stroke: "#9ca3af",
                            strokeWidth: isSelected ? 2 : 1,
                            outline: "none",
                          },
                          hover: {
                            fill: "hsl(var(--primary))",
                            stroke: "#6366f1",
                            strokeWidth: 2,
                            outline: "none",
                            cursor: "pointer",
                          },
                          pressed: {
                            fill: "hsl(var(--primary))",
                            stroke: "#6366f1",
                            strokeWidth: 2,
                            outline: "none",
                          },
                        }}
                        onMouseEnter={() => setSelectedCountry(geo.properties.name)}
                        onMouseLeave={() => setSelectedCountry(null)}
                      />
                    );
                  })
                }
              </Geographies>
              
              {locations.map((location, index) => (
                <Marker
                  key={`${location.country}-${index}`}
                  coordinates={location.coordinates}
                  onMouseEnter={() => setHoveredMarker(location.views[0])}
                  onMouseLeave={() => setHoveredMarker(null)}
                >
                  <circle
                    r={getMarkerSize(location.count)}
                    fill={getMarkerColor(location.count)}
                    stroke="#fff"
                    strokeWidth={2}
                    className="cursor-pointer transition-all duration-200 hover:opacity-80"
                    style={{
                      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
                    }}
                  />
                </Marker>
              ))}
            </ZoomableGroup>
          </ComposableMap>
          
          {/* Tooltip */}
          {hoveredMarker && (
            <div className="absolute top-4 left-4 bg-background border border-border rounded-lg p-4 shadow-lg max-w-xs">
              <div className="space-y-2">
                <div className="font-semibold">
                  {hoveredMarker.city && hoveredMarker.country 
                    ? `${hoveredMarker.city}, ${hoveredMarker.country}` 
                    : hoveredMarker.country || 'Unknown Location'
                  }
                </div>
                <div className="text-sm text-muted-foreground">
                  Page: {hoveredMarker.page_path}
                </div>
                <div className="text-sm text-muted-foreground">
                  IP: {hoveredMarker.ip_address || 'Unknown'}
                </div>
                <div className="text-xs text-muted-foreground">
                  {new Date(hoveredMarker.created_at).toLocaleString()}
                </div>
              </div>
            </div>
          )}
          
          {/* Legend */}
          <div className="absolute bottom-4 right-4 bg-background border border-border rounded-lg p-3 shadow-lg">
            <div className="text-xs font-semibold mb-2">View Intensity</div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-xs">Low</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                <span className="text-xs">Medium</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                <span className="text-xs">High</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-xs">Very High</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Location Stats */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{locations.length}</div>
            <div className="text-sm text-muted-foreground">Countries</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{pageViews.length}</div>
            <div className="text-sm text-muted-foreground">Total Views</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">
              {locations.length > 0 ? Math.max(...locations.map(loc => loc.count)) : 0}
            </div>
            <div className="text-sm text-muted-foreground">Max Views/Location</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">
              {locations.length > 0 ? Math.round(pageViews.length / locations.length) : 0}
            </div>
            <div className="text-sm text-muted-foreground">Avg Views/Country</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
