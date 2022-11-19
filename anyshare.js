(async function () {
  const postJson = async (url, data) => {
    const ret = await $.post(url, JSON.stringify(data))
    return JSON.parse(ret)
  }
  const processDir = async ({ dirs, files }, dirname) => {
    console.log("正在加载文件夹", dirname);
    let RET = "文件夹{" + dirname + "}下有" + files.length + "文件\n"
    for (let i = 0; i < files.length; i++) {
      RET += await getDownloadUrl(files[i])
    }
    RET += "文件夹{" + dirname + "}下有" + dirs.length + "文件夹\n"
    for (let i = 0; i < dirs.length; i++) {
      const dirInfo = await listDir(dirs[i].docid)
      RET += await processDir(dirInfo, dirname + "/" + dirs[i].name)
    }
    return RET
  }
  const getDownloadUrl = async ({ docid, rev, name }) => {
    const playinfo = await postJson("https://anyshare.sufe.edu.cn:9124/v1/link?method=playinfo", {
      docid,
      link: currentHash,
      password: baseLink.password,
      rev,
    })
    return `"https://anyshare.sufe.edu.cn:9124/v1/link?method=play&docid=${playinfo.docid}&reqhost=anyshare.sufe.edu.cn&usehttps=true" --saveName "${name}"\n`
  }
  const listDir = async (docid) => {
    return await postJson("https://anyshare.sufe.edu.cn:9124/v1/link?method=listdir", {
      by: "name",
      sort: "asc",
      link: currentHash,
      password: baseLink.password,
      docid
    })
  }
  const currentHash = location.hash.split("?")[0].split("/")[2]
  const baseLink = session.get("link")[currentHash]
  const baseDir = await listDir(baseLink.docid)
  let OUTPUT = "根目录：" + baseLink.name + "|" + baseLink.usrdisplayname + "|" + baseLink.usrloginname + "\n"
  OUTPUT += await processDir(baseDir, baseLink.name)
  console.log(OUTPUT);
})()