/// <reference types="react-scripts" />

declare module 'react' {
  interface ReactElement<P = any, T extends string | JSXElementConstructor<any> = string | JSXElementConstructor<any>> {
    type: T;
    props: P;
    key: Key | null;
  }
}

declare module 'react-router-dom' {
  export function useNavigate(): (path: string) => void;
  export function useParams<T extends Record<string, string | undefined>>(): T;
  export function BrowserRouter(props: any): JSX.Element;
  export function Routes(props: any): JSX.Element;
  export function Route(props: any): JSX.Element;
  export const Outlet: React.ComponentType<any>;
}

declare module '@mui/material' {
  export const Container: React.ComponentType<any>;
  export const Paper: React.ComponentType<any>;
  export const Typography: React.ComponentType<any>;
  export const Button: React.ComponentType<any>;
  export const FormControlLabel: React.ComponentType<any>;
  export const Checkbox: React.ComponentType<any>;
  export const MenuItem: React.ComponentType<any>;
  export const Select: React.ComponentType<any>;
  export const FormControl: React.ComponentType<any>;
  export const InputLabel: React.ComponentType<any>;
  export const Grid: React.ComponentType<any>;
  export const Box: React.ComponentType<any>;
  export const CircularProgress: React.ComponentType<any>;
  export const Alert: React.ComponentType<any>;
  export const Card: React.ComponentType<any>;
  export const CardMedia: React.ComponentType<any>;
  export const CardContent: React.ComponentType<any>;
  export const CardActions: React.ComponentType<any>;
  export const Chip: React.ComponentType<any>;
  export const TextField: React.ComponentType<any>;
  export const Divider: React.ComponentType<any>;
  export const List: React.ComponentType<any>;
  export const ListItem: React.ComponentType<any>;
  export const ListItemText: React.ComponentType<any>;
  export const Slider: React.ComponentType<any>;
  export const Switch: React.ComponentType<any>;
  export const LinearProgress: React.ComponentType<any>;
  export const Tabs: React.ComponentType<any>;
  export const Tab: React.ComponentType<any>;
  export const Menu: React.ComponentType<any>;
  export const MenuItem: React.ComponentType<any>;
  export const IconButton: React.ComponentType<any>;
  export const InputAdornment: React.ComponentType<any>;
  export const Tooltip: React.ComponentType<any>;
  export const Pagination: React.ComponentType<any>;
}

declare module '@mui/icons-material' {
  export const Add: React.ComponentType<any>;
  export const Search: React.ComponentType<any>;
  export const VideoLibrary: React.ComponentType<any>;
  export const AudioTrack: React.ComponentType<any>;
  export const Videocam: React.ComponentType<any>;
  export const Audiotrack: React.ComponentType<any>;
  export const Category: React.ComponentType<any>;
  export const CheckCircle: React.ComponentType<any>;
  export const Error: React.ComponentType<any>;
  export const HighQuality: React.ComponentType<any>;
  export const Translate: React.ComponentType<any>;
  export const VolumeUp: React.ComponentType<any>;
  export const Equalizer: React.ComponentType<any>;
  export const Compare: React.ComponentType<any>;
  export const Save: React.ComponentType<any>;
  export const Undo: React.ComponentType<any>;
  export const PlayArrow: React.ComponentType<any>;
  export const Pause: React.ComponentType<any>;
  export const SkipNext: React.ComponentType<any>;
  export const SkipPrevious: React.ComponentType<any>;
  export const Edit: React.ComponentType<any>;
  export const Download: React.ComponentType<any>;
  export const MoreVert: React.ComponentType<any>;
  export const ContentCopy: React.ComponentType<any>;
}

declare module 'react-dropzone' {
  export function useDropzone(options: any): {
    getRootProps: () => any;
    getInputProps: () => any;
    isDragActive: boolean;
  };
} 