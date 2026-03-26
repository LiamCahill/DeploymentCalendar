import { pdf, Document, Page, Text, View, Image, StyleSheet, Font } from '@react-pdf/renderer'
import { supabase, type Post } from '@/lib/supabase'

Font.register({
  family: 'Helvetica',
  fonts: [],
})

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const styles = StyleSheet.create({
  page: {
    padding: 48,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#1c1917',
    backgroundColor: '#ffffff',
  },
  titlePage: {
    padding: 48,
    justifyContent: 'center',
    alignItems: 'center',
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
  },
  titleText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1c1917',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#78716c',
  },
  daySection: {
    marginBottom: 20,
  },
  dayHeader: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1c1917',
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#e7e5e4',
  },
  postContainer: {
    marginBottom: 12,
    paddingLeft: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#e7e5e4',
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 6,
  },
  colorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  authorName: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#44403c',
  },
  postTime: {
    fontSize: 8,
    color: '#a8a29e',
    marginLeft: 4,
  },
  postContent: {
    fontSize: 10,
    color: '#292524',
    lineHeight: 1.5,
    marginBottom: 6,
  },
  photosRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  photo: {
    width: 140,
    height: 100,
    objectFit: 'cover',
    borderRadius: 4,
  },
})

async function fetchBase64(signedUrl: string): Promise<string> {
  const res = await fetch(signedUrl)
  const blob = await res.blob()
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

interface PostWithImages extends Post {
  imageDataUrls: string[]
}

interface DayGroup {
  date: string
  posts: PostWithImages[]
}

function groupByDay(posts: PostWithImages[]): DayGroup[] {
  const map = new Map<string, PostWithImages[]>()
  for (const post of posts) {
    const existing = map.get(post.date) ?? []
    existing.push(post)
    map.set(post.date, existing)
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, posts]) => ({ date, posts }))
}

function PdfDocument({ year, month, days }: { year: number; month: number; days: DayGroup[] }) {
  const title = `${MONTH_NAMES[month]} ${year}`

  return (
    <Document title={title} author="Family Calendar">
      {/* Title page */}
      <Page size="A4" style={styles.titlePage}>
        <Text style={styles.titleText}>{title}</Text>
        <Text style={styles.subtitle}>Family Calendar</Text>
      </Page>

      {/* Content page */}
      <Page size="A4" style={styles.page}>
        {days.map(({ date, posts }) => {
          const [_y, _m, d] = date.split('-')
          const dayNum = parseInt(d, 10)

          return (
            <View key={date} style={styles.daySection} wrap={false}>
              <Text style={styles.dayHeader}>
                {MONTH_NAMES[month]} {dayNum}
              </Text>

              {posts.map((post) => (
                <View key={post.id} style={styles.postContainer}>
                  <View style={styles.authorRow}>
                    <View
                      style={[styles.colorDot, { backgroundColor: post.author_color }]}
                    />
                    <Text style={styles.authorName}>{post.author_name}</Text>
                    <Text style={styles.postTime}>
                      {new Date(post.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </View>

                  {post.content ? (
                    <Text style={styles.postContent}>{post.content}</Text>
                  ) : null}

                  {post.imageDataUrls.length > 0 && (
                    <View style={styles.photosRow}>
                      {post.imageDataUrls.map((src, i) => (
                        <Image key={i} src={src} style={styles.photo} />
                      ))}
                    </View>
                  )}
                </View>
              ))}
            </View>
          )
        })}
      </Page>
    </Document>
  )
}

export async function exportMonthPdf(year: number, month: number): Promise<void> {
  const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`
  const endDate = `${year}-${String(month + 1).padStart(2, '0')}-${new Date(year, month + 1, 0).getDate()}`

  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true })
    .order('created_at', { ascending: true })

  if (error) throw error

  const posts = (data ?? []) as Post[]
  if (posts.length === 0) throw new Error('NO_POSTS')

  // Fetch and embed photos
  const postsWithImages: PostWithImages[] = await Promise.all(
    posts.map(async (post) => {
      const imageDataUrls: string[] = []

      for (const path of post.photo_paths) {
        try {
          const { data: urlData } = await supabase.storage
            .from('post-photos')
            .createSignedUrl(path, 300)
          if (urlData?.signedUrl) {
            const dataUrl = await fetchBase64(urlData.signedUrl)
            imageDataUrls.push(dataUrl)
          }
        } catch {
          // Skip failed images
        }
      }

      return { ...post, imageDataUrls }
    })
  )

  const days = groupByDay(postsWithImages)
  const blob = await pdf(
    <PdfDocument year={year} month={month} days={days} />
  ).toBlob()

  // Trigger download
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${year}-${String(month + 1).padStart(2, '0')}.pdf`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
