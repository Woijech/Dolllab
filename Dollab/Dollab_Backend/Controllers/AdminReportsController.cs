using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Dollab_Backend.Controllers
{
    public class AdminReportsController : Controller
    {
        // GET: AdminReportsController
        public ActionResult Index()
        {
            return View();
        }

        // GET: AdminReportsController/Details/5
        public ActionResult Details(int id)
        {
            return View();
        }

        // GET: AdminReportsController/Create
        public ActionResult Create()
        {
            return View();
        }

        // POST: AdminReportsController/Create
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Create(IFormCollection collection)
        {
            try
            {
                return RedirectToAction(nameof(Index));
            }
            catch
            {
                return View();
            }
        }

        // GET: AdminReportsController/Edit/5
        public ActionResult Edit(int id)
        {
            return View();
        }

        // POST: AdminReportsController/Edit/5
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Edit(int id, IFormCollection collection)
        {
            try
            {
                return RedirectToAction(nameof(Index));
            }
            catch
            {
                return View();
            }
        }

        // GET: AdminReportsController/Delete/5
        public ActionResult Delete(int id)
        {
            return View();
        }

        // POST: AdminReportsController/Delete/5
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Delete(int id, IFormCollection collection)
        {
            try
            {
                return RedirectToAction(nameof(Index));
            }
            catch
            {
                return View();
            }
        }
    }
}
