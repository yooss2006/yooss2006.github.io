type Props = {
  edges: {
    node: { frontmatter: { title: string; categories: string; id: number } }
  }[]
}
export type Post = {
  categories: string
  post: { title: string; id: number }[]
}

const useCategories = ({ edges }: Props) => {
  const parseData = edges.map(item => item.node.frontmatter)
  console.log(parseData)
  const categories = new Set(parseData.map(item => item.categories))
  const posts = Array.from(categories).map(item => {
    const post = parseData
      .filter(data => data.categories === item)
      .map(data => ({
        title: data.title,
        id: data.id,
      }))
    return {
      categories: item,
      post,
    }
  })
  return { posts }
}

export default useCategories
