const formatDocsName = (name) => {
    if (!name) {
        return null;
    }

    const regexRemove = /[^a-zA-Z0-9[\-_\s]/g;

    return name.toLowerCase().trim().replace(/\s/g, '-').replace(regexRemove, '').replace(/\//g, 'and');
}

module.exports = {
    formatDocsName
}