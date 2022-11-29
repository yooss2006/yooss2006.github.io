type Props = {
  edges: { node: { frontmatter: { title: string; categories: string } } }[]
}
export type Posts = { categories: string; post: string[] }[]

const useCategories = ({ edges }: Props) => {
  const parseData = edges.map(item => item.node.frontmatter)
  const categories = new Set(parseData.map(item => item.categories))
  const posts = Array.from(categories).map(item => {
    const post = parseData
      .filter(data => data.categories === item)
      .map(data => data.title)
    return {
      categories: item,
      post,
    }
  })
  return { posts }
}

export default useCategories
