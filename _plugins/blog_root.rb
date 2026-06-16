# frozen_string_literal: true

# Treat ./blog as the content root for this site.
#
#   1. {% link foo/bar.md %} resolves to blog/foo/bar.md
#      (the raw path is still tried first, so existing fully-qualified
#       paths and any non-blog usage keep working).
#   2. Only Markdown files under ./blog are rendered as pages. Stray
#      Markdown elsewhere in the repo (README, theme docs, etc.) is dropped.
#      Non-Markdown pages (assets/*.scss, 404.html) are left untouched.
#
# Requires the GitHub Actions build (jekyll build) — the classic
# "deploy from a branch" Pages mode runs in safe mode and ignores _plugins/.

module Jekyll
  module Tags
    # Reopen the built-in {% link %} tag (Jekyll 4.4.x) so it falls back to a
    # blog/-prefixed lookup, making ./blog behave as the link root.
    class Link < Liquid::Tag
      BLOG_ROOT = "blog/"

      def render(context)
        @context = context
        site = context.registers[:site]
        requested = Liquid::Template.parse(@relative_path).render(context)

        candidates = [requested]
        candidates << "#{BLOG_ROOT}#{requested}" unless requested.start_with?(BLOG_ROOT)

        candidates.each do |path|
          path_with_leading_slash = PathManager.join("", path)
          site.each_site_file do |item|
            return relative_url(item) if item.relative_path == path
            return relative_url(item) if item.relative_path == path_with_leading_slash
          end
        end

        raise ArgumentError, <<~MSG
          Could not find document '#{requested}' (also tried '#{BLOG_ROOT}#{requested}') in tag '#{self.class.tag_name}'.

          Make sure the file exists under ./blog and the path is correct.
        MSG
      end
    end
  end
end

# Render only Markdown that lives under ./blog. Non-Markdown pages such as the
# compiled stylesheets under assets/ and the root 404.html are preserved.
Jekyll::Hooks.register :site, :post_read do |site|
  markdown_exts = %w[.md .markdown]
  site.pages.reject! do |page|
    markdown_exts.include?(page.extname.downcase) && !page.path.start_with?("blog/")
  end
end
