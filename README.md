# Wallyford Community Council website

A simple website for Wallyford Community Council, built with [Jekyll](https://jekyllrb.com/) so that GitHub Pages can host it for free.

## Pages

| Page | File |
| --- | --- |
| Home | `index.html` |
| News (list and posts) | `news.html`, posts in `_posts/` |
| History (village history, mining, the Bing, the Drift) | `wallyford.html` |
| The Council (remit, who we are, meetings, Torchlight Parade) | `council.html` |
| Local groups (TRAs, Neighbourhood Watch) | `groups.html` |
| Report it | `report.html` |
| You said, we did | `you-said-we-did.html` |
| Community Speedwatch (results ticker, how it works, volunteering) | `speedwatch.html` |

## Everyday updates (no coding needed)

You can edit any of these files on github.com: open the file, click the pencil icon, make the change, then click **Commit changes**. The live site updates a minute or two later.

- **Contact details, Facebook link, meeting details:** `_config.yml`
- **Councillors (names, roles, photos, blurbs):** `_data/councillors.yml`. Put photos in `assets/img/people/` and add the file name to `photo:`.
- **Local groups:** `_data/groups.yml`
- **News:** add a Markdown file to `_posts/`, named like `2026-11-30-christmas-lights.md`. Copy `_posts/2026-10-28-agm.md` as a starting point. The newest post appears on the home page automatically.
- **Coming up (home page):** regular events (meetings, Remembrance Sunday, Armistice Day, Torchlight Parade, Gala Day, Pinkie commemoration) are worked out automatically. Add one-off events to `_data/events.yml`. Past events disappear by themselves.
- **Ward councillors (Report it page):** `_data/ward_councillors.yml`. Check after each council election.
- **You said, we did:** you don't edit the website at all. Update the Google Sheet and the page picks up the changes (see below).
- **Speedwatch results:** the same. Add a row to the Speedwatch results sheet after each session (see below).
- **Speedwatch areas (Up and running / Getting set up):** `_data/speedwatch.yml`. When Wallyford's scheme starts, change its status to `Up and running`.

## You said, we did

The page reads a Google Sheet published as CSV.

1. Open the tracker sheet in Google Drive (*Wallyford CC - You said, we did tracker*). Its **How to use** tab explains each column.
2. In the sheet: **File > Share > Publish to web**. Under *Link*, choose the **Tracker** tab and **Comma-separated values (.csv)**, then **Publish**.
3. Copy the link and paste it into `tracker_csv_url` in `_config.yml`.

Only rows with **Show on website** ticked appear. The page lists ongoing entries first and done ones after, each with the most recently updated at the top.

**Automatic "Last updated" (recommended):** paste `tools/tracker-auto-date.gs` into the sheet once (Extensions > Apps Script, paste, Save). After that, editing "You said", "We did", "Status" or "Show on website" sets "Last updated" to today, so edited entries move to the top by themselves.

Never put residents' names or contact details in the sheet: everything on the Tracker tab is public once published.

Until a link is added, the page shows a labelled preview from `assets/data/tracker-preview.csv` (in draft mode only).

## Community Speedwatch results

The Speedwatch page shows a running total (vehicles checked, how many were over the limit, and the share who kept to the limit) as rolling odometer-style counters, plus a list of recent sessions. Like *You said, we did*, it reads a Google Sheet published as CSV.

**Connecting the sheet (once):**

1. Open the results sheet in Google Drive (*Wallyford CC - Community Speedwatch results*). Its **How to use** tab explains each column. The **Results** tab has these columns, with dropdowns for Area and Speed limit and a checkbox for Show on website:

   | Date | Area | Location | Speed limit (mph) | Vehicles checked | Over the limit | Note for website | Show on website |
   | --- | --- | --- | --- | --- | --- | --- | --- |

2. In the sheet: **File > Share > Publish to web**. Under *Link*, choose the **Results** tab and **Comma-separated values (.csv)**, then **Publish**.
3. Copy the link and paste it into `speedwatch_csv_url` in `_config.yml`.

If you ever make a new sheet instead, keep the same column headings and set **File > Settings > Locale** to *United Kingdom*, so dates are read as day/month.

**After each session**, add one row:

- **Date:** type it as 4/11/2026.
- **Area** and **Location:** for example *Wallyford* and *Salters Road*.
- **Speed limit (mph):** just the number, for example 30.
- **Vehicles checked:** every vehicle the device recorded.
- **Over the limit:** the number of vehicles passed to Police Scotland.
- **Note for website** (optional): a short public note, for example a thank-you.
- Tick **Show on website**.

Only rows with **Show on website** ticked are counted. The area buttons on the page appear by themselves once there are results from more than one area.

Never put registration numbers, descriptions of vehicles or drivers, or volunteers' names in this sheet: everything on the Results tab is public once published.

Until a link is added, the page shows clearly labelled example figures from `assets/data/speedwatch-preview.csv` (in draft mode only). While results are loading, or when the sheet has no rows yet, the counters spin with a "No results yet" message.

## Before going live

- Set `show_review_notes: false` in `_config.yml`. This hides the purple "Please check" and "To fill in" notes, which are there for the council to work through.
- Add the Facebook group link, the tracker link, the Speedwatch results link, councillor photos and blurbs, and local group details.
- Check that you have permission to use every photo.

## Getting on Google

The site is already set up for search engines (page titles and descriptions, a sitemap, structured data describing the council, and sharing previews for Facebook). While `show_review_notes` is `true`, every page tells search engines **not** to list it, so draft notes never end up on Google. Setting it to `false` lifts that automatically.

On launch day:

1. Set `show_review_notes: false` in `_config.yml`.
2. Go to [Google Search Console](https://search.google.com/search-console), add a **URL prefix** property for `https://dochtie.github.io/wallyford-community-council/`.
3. Choose **HTML tag** verification. Copy just the code from inside `content="..."` and paste it into `google_site_verification` in `_config.yml`. Wait a couple of minutes for the site to update, then click **Verify**.
4. In Search Console, open **Sitemaps** and submit `sitemap.xml`.
5. Use **URL inspection** on the home page and click **Request indexing**.

Links from other trusted sites help most: ask East Lothian Council (Connected Communities team) to add the website to the council's listing, and add it to the Facebook group's About section.

If you move to your own web address later, add it in Search Console as a new property and submit the sitemap again.

## Turning on GitHub Pages

In the repository on GitHub: **Settings > Pages**. Under *Build and deployment*, choose **Deploy from a branch**, pick `main` and `/ (root)`, and save. The site appears at `https://dochtie.github.io/wallyford-community-council/`.

If you later buy a web address (for example `wallyfordcc.org.uk`), add it under **Settings > Pages > Custom domain** and change `baseurl` to `""` in `_config.yml`.

## Previewing on your own computer (optional)

```
gem install jekyll
jekyll serve
```

Then open http://localhost:4000/wallyford-community-council/.
