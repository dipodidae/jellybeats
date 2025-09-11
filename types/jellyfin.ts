// Basic Jellyfin API response typings used in the app
// Extend/refine as needed based on Jellyfin's Swagger schema

export interface JellyfinBaseItem {
  Id: string
  Name: string
  ImageTags?: Record<string, string>
  RunTimeTicks?: number
  IndexNumber?: number
  Album?: string
  AlbumArtist?: string
  Artists?: string[]
  Type?: string
}

export interface JellyfinItemsResponse<T extends JellyfinBaseItem = JellyfinBaseItem> {
  Items: T[]
  TotalRecordCount?: number
  StartIndex?: number
}

export interface JellyfinPlaylist extends JellyfinBaseItem {
  SongCount?: number
}

export interface JellyfinTrack extends JellyfinBaseItem {
  Album?: string
  AlbumArtist?: string
  MediaSources?: Array<{ Id: string, Bitrate?: number, Container?: string }>
}
