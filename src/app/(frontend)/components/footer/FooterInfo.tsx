import React from "react";
import Link from "next/link";

export const FooterInfo: React.FC = () => {
  return (
    <div className="bg-black p-16 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          {/* Company Info */}
          <div>
            <h4 className="mb-5 text-xl font-semibold">Symmetric s.r.o.</h4>
            <div className="mb-5 space-y-2 text-gray-300">
              <p>Mliekarenska 7</p>
              <p>82109 Bratislava</p>
              <p>Slovak Republic</p>
              <p>
                <strong>ID:</strong> 47 068 124
              </p>
              <p>
                <strong>VAT No:</strong> SK2023741973
              </p>
              <p>
                <strong>Office:</strong> +421 948 262 346
              </p>
            </div>
          </div>

          {/* Support Info */}
          <div>
            <h4 className="mb-5 text-xl font-semibold">
              Booking & Customer Support
            </h4>
            <div className="mb-5 space-y-2 text-gray-300">
              <p>
                <strong>Number:</strong> +421 222 200 543 (9:00 - 17:00 CET)
              </p>
              <p>
                <strong>Email:</strong>
                <a
                  href="mailto:info@symmetric.events"
                  className="text-blue-400 hover:text-secondary"
                >
                  {" "}
                  info@symmetric.events
                </a>
              </p>
            </div>
            <div className="mt-5">
              <a
                href="https://www.linkedin.com/company/symmetrictraining"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block"
              >
                <img
                  src="https://www.symmetric.events/wp-content/uploads/2020/12/5e205a7e0c12245d6564a43a_LI-Logo-p-500-100x24.png"
                  alt="LinkedIn"
                  width="100"
                  height="24"
                  className="hover:opacity-80"
                />
              </a>
            </div>
            <div className="my-5 space-y-2">
              <Link
                href="/terms-conditions"
                className="block text-gray-300 hover:text-secondary"
              >
                Terms & Conditions
              </Link>
              <Link
                href="/privacy-policy"
                className="block text-gray-300 hover:text-secondary"
              >
                Privacy Policy
              </Link>
              <span className="block cursor-pointer text-gray-300 hover:text-secondary">
                Change Your Cookie Consent
              </span>
            </div>
          </div>

          {/* Google Map */}
          <div>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2660.4404227874717!2d17.132541376471217!3d48.15579737123383!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x476c892e06493397%3A0x949460c58734648f!2sMliek%C3%A1rensk%C3%A1%207%2C%20821%2009%20Bratislava!5e0!3m2!1ssk!2ssk!4v1699263470989!5m2!1ssk!2ssk"
              width="100%"
              height="250"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Symmetric s.r.o. Location"
            />
            <p className="text-right text-sm mt-5 text-gray-400">
              © {new Date().getFullYear()} <strong>Symmetric s.r.o.</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
